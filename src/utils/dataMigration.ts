import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// 현재 데이터 스키마 버전
const CURRENT_SCHEMA_VERSION = '2.0.0';

// 컬렉션 이름
const COLLECTIONS = {
  FOCUS_CYCLES: 'focus_cycles',
  DAILY_CHECKLISTS: 'daily_checklists',
  SETTINGS: 'settings',
  MIGRATION_LOG: 'migration_log'
};

// 데이터 스키마 정의
interface FocusCycleSchema {
  id: string;
  date: string;
  duration: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  schemaVersion?: string;
}

interface DailyChecklistSchema {
  id: string;
  date: string;
  data: {
    morning?: string[];
    lunch?: string[];
    evening?: string[];
    reflection?: string[]; // 새로 추가된 필드
  };
  createdAt: any;
  updatedAt: any;
  schemaVersion?: string;
}

interface MigrationLog {
  id: string;
  version: string;
  description: string;
  executedAt: any;
  status: 'success' | 'failed' | 'partial';
  details: string;
  affectedDocuments: number;
}

// 마이그레이션 결과 타입
export interface MigrationResult {
  success: boolean;
  message: string;
  details: {
    totalDocuments: number;
    migratedDocuments: number;
    failedDocuments: number;
    errors: string[];
  };
}

// 스키마 버전 확인
export const checkSchemaVersion = async (collectionName: string): Promise<{
  currentVersion: string;
  needsMigration: boolean;
  documents: any[];
}> => {
  try {
    const q = query(
      collection(db, collectionName),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 스키마 버전이 없는 문서가 있는지 확인
    const needsMigration = documents.some(doc => !doc.schemaVersion);

    return {
      currentVersion: CURRENT_SCHEMA_VERSION,
      needsMigration,
      documents
    };
  } catch (error) {
    console.error('스키마 버전 확인 실패:', error);
    throw error;
  }
};

// 포커스 사이클 마이그레이션
export const migrateFocusCycles = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    message: '',
    details: {
      totalDocuments: 0,
      migratedDocuments: 0,
      failedDocuments: 0,
      errors: []
    }
  };

  try {
    console.log('포커스 사이클 마이그레이션 시작...');

    // 모든 포커스 사이클 조회
    const q = query(collection(db, COLLECTIONS.FOCUS_CYCLES));
    const querySnapshot = await getDocs(q);

    result.details.totalDocuments = querySnapshot.docs.length;

    if (querySnapshot.empty) {
      result.success = true;
      result.message = '마이그레이션할 포커스 사이클이 없습니다.';
      return result;
    }

    // 배치 업데이트를 위한 준비
    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500; // Firestore 배치 제한

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();

      // 이미 최신 스키마인 경우 건너뛰기
      if (data.schemaVersion === CURRENT_SCHEMA_VERSION) {
        continue;
      }

      try {
        // 마이그레이션할 데이터 준비
        const migratedData: Partial<FocusCycleSchema> = {
          ...data,
          schemaVersion: CURRENT_SCHEMA_VERSION,
          updatedAt: serverTimestamp()
        };

        // 누락된 필드 추가
        if (!migratedData.createdAt) {
          migratedData.createdAt = serverTimestamp();
        }

        // 배치에 업데이트 추가
        const docRef = doc(db, COLLECTIONS.FOCUS_CYCLES, docSnapshot.id);
        batch.update(docRef, migratedData);
        batchCount++;

        // 배치 크기 제한 확인
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          result.details.migratedDocuments += batchCount;
          batchCount = 0;
        }

      } catch (error) {
        console.error(`문서 ${docSnapshot.id} 마이그레이션 실패:`, error);
        result.details.failedDocuments++;
        result.details.errors.push(`문서 ${docSnapshot.id}: ${error.message}`);
      }
    }

    // 남은 배치 커밋
    if (batchCount > 0) {
      await batch.commit();
      result.details.migratedDocuments += batchCount;
    }

    // 마이그레이션 로그 저장
    await logMigration('focus_cycles', '포커스 사이클 스키마 업데이트', result);

    result.success = result.details.failedDocuments === 0;
    result.message = `포커스 사이클 마이그레이션 완료: ${result.details.migratedDocuments}개 문서 업데이트`;

    console.log('포커스 사이클 마이그레이션 완료:', result);
    return result;

  } catch (error) {
    console.error('포커스 사이클 마이그레이션 실패:', error);
    result.details.errors.push(`전체 마이그레이션 실패: ${error.message}`);
    return result;
  }
};

// 일일 체크리스트 마이그레이션
export const migrateDailyChecklists = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    message: '',
    details: {
      totalDocuments: 0,
      migratedDocuments: 0,
      failedDocuments: 0,
      errors: []
    }
  };

  try {
    console.log('일일 체크리스트 마이그레이션 시작...');

    // 모든 일일 체크리스트 조회
    const q = query(collection(db, COLLECTIONS.DAILY_CHECKLISTS));
    const querySnapshot = await getDocs(q);

    result.details.totalDocuments = querySnapshot.docs.length;

    if (querySnapshot.empty) {
      result.success = true;
      result.message = '마이그레이션할 일일 체크리스트가 없습니다.';
      return result;
    }

    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500;

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();

      // 이미 최신 스키마인 경우 건너뛰기
      if (data.schemaVersion === CURRENT_SCHEMA_VERSION) {
        continue;
      }

      try {
        // 마이그레이션할 데이터 준비
        const migratedData: Partial<DailyChecklistSchema> = {
          ...data,
          schemaVersion: CURRENT_SCHEMA_VERSION,
          updatedAt: serverTimestamp()
        };

        // 누락된 필드 추가
        if (!migratedData.createdAt) {
          migratedData.createdAt = serverTimestamp();
        }

        // reflection 섹션이 없는 경우 추가
        if (migratedData.data && !migratedData.data.reflection) {
          migratedData.data.reflection = [];
        }

        // 배치에 업데이트 추가
        const docRef = doc(db, COLLECTIONS.DAILY_CHECKLISTS, docSnapshot.id);
        batch.update(docRef, migratedData);
        batchCount++;

        // 배치 크기 제한 확인
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          result.details.migratedDocuments += batchCount;
          batchCount = 0;
        }

      } catch (error) {
        console.error(`문서 ${docSnapshot.id} 마이그레이션 실패:`, error);
        result.details.failedDocuments++;
        result.details.errors.push(`문서 ${docSnapshot.id}: ${error.message}`);
      }
    }

    // 남은 배치 커밋
    if (batchCount > 0) {
      await batch.commit();
      result.details.migratedDocuments += batchCount;
    }

    // 마이그레이션 로그 저장
    await logMigration('daily_checklists', '일일 체크리스트 스키마 업데이트', result);

    result.success = result.details.failedDocuments === 0;
    result.message = `일일 체크리스트 마이그레이션 완료: ${result.details.migratedDocuments}개 문서 업데이트`;

    console.log('일일 체크리스트 마이그레이션 완료:', result);
    return result;

  } catch (error) {
    console.error('일일 체크리스트 마이그레이션 실패:', error);
    result.details.errors.push(`전체 마이그레이션 실패: ${error.message}`);
    return result;
  }
};

// 전체 마이그레이션 실행
export const runFullMigration = async (): Promise<{
  success: boolean;
  results: {
    focusCycles: MigrationResult;
    dailyChecklists: MigrationResult;
  };
  summary: {
    totalDocuments: number;
    totalMigrated: number;
    totalFailed: number;
    hasErrors: boolean;
  };
}> => {
  console.log('전체 데이터 마이그레이션 시작...');

  const results = {
    focusCycles: await migrateFocusCycles(),
    dailyChecklists: await migrateDailyChecklists()
  };

  const summary = {
    totalDocuments: results.focusCycles.details.totalDocuments + results.dailyChecklists.details.totalDocuments,
    totalMigrated: results.focusCycles.details.migratedDocuments + results.dailyChecklists.details.migratedDocuments,
    totalFailed: results.focusCycles.details.failedDocuments + results.dailyChecklists.details.failedDocuments,
    hasErrors: results.focusCycles.details.errors.length > 0 || results.dailyChecklists.details.errors.length > 0
  };

  const success = results.focusCycles.success && results.dailyChecklists.success;

  console.log('전체 마이그레이션 완료:', { results, summary, success });

  return {
    success,
    results,
    summary
  };
};

// 마이그레이션 로그 저장
const logMigration = async (collection: string, description: string, result: MigrationResult): Promise<void> => {
  try {
    const logData: Omit<MigrationLog, 'id'> = {
      version: CURRENT_SCHEMA_VERSION,
      description,
      executedAt: serverTimestamp(),
      status: result.success ? 'success' : (result.details.failedDocuments > 0 ? 'partial' : 'failed'),
      details: JSON.stringify(result.details),
      affectedDocuments: result.details.migratedDocuments
    };

    const docRef = doc(collection(db, COLLECTIONS.MIGRATION_LOG));
    await updateDoc(docRef, logData);
  } catch (error) {
    console.error('마이그레이션 로그 저장 실패:', error);
  }
};

// 마이그레이션 로그 조회
export const getMigrationLogs = async (): Promise<MigrationLog[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.MIGRATION_LOG),
      orderBy('executedAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MigrationLog));
  } catch (error) {
    console.error('마이그레이션 로그 조회 실패:', error);
    return [];
  }
};

// 데이터 정리 (개발용)
export const cleanupOldData = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    message: '',
    details: {
      totalDocuments: 0,
      migratedDocuments: 0,
      failedDocuments: 0,
      errors: []
    }
  };

  try {
    console.log('오래된 데이터 정리 시작...');

    // 30일 이전 데이터 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(
      collection(db, COLLECTIONS.FOCUS_CYCLES),
      where('createdAt', '<', thirtyDaysAgo)
    );

    const querySnapshot = await getDocs(q);
    result.details.totalDocuments = querySnapshot.docs.length;

    if (querySnapshot.empty) {
      result.success = true;
      result.message = '정리할 오래된 데이터가 없습니다.';
      return result;
    }

    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500;

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const docRef = doc(db, COLLECTIONS.FOCUS_CYCLES, docSnapshot.id);
        batch.delete(docRef);
        batchCount++;

        if (batchCount >= maxBatchSize) {
          await batch.commit();
          result.details.migratedDocuments += batchCount;
          batchCount = 0;
        }
      } catch (error) {
        console.error(`문서 ${docSnapshot.id} 삭제 실패:`, error);
        result.details.failedDocuments++;
        result.details.errors.push(`문서 ${docSnapshot.id}: ${error.message}`);
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      result.details.migratedDocuments += batchCount;
    }

    result.success = result.details.failedDocuments === 0;
    result.message = `오래된 데이터 정리 완료: ${result.details.migratedDocuments}개 문서 삭제`;

    return result;

  } catch (error) {
    console.error('오래된 데이터 정리 실패:', error);
    result.details.errors.push(`전체 정리 실패: ${error.message}`);
    return result;
  }
};
