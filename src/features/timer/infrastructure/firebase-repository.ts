import { 
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { FocusCycle, FocusCycleRepository } from '../domain/types';
import { safeTimestampToDate } from '../../../utils/storage/firebaseUtils';

const COLLECTION_NAME = 'focus_cycles';

/**
 * Firebase 문서를 포커스 사이클로 변환하는 순수 함수
 * @param id 문서 ID
 * @param data 문서 데이터
 * @returns 포커스 사이클
 */
function mapDocumentToCycle(id: string, data: any): FocusCycle {
  return {
    id,
    date: data.date,
    task: data.task,
    startTime: safeTimestampToDate(data.startTime),
    endTime: safeTimestampToDate(data.endTime),
    timeSpent: data.timeSpent,
    result: data.result || '',
    distractions: data.distractions || '',
    thoughts: data.thoughts || ''
  };
}

/**
 * Firebase 문서들을 포커스 사이클 배열로 변환하는 순수 함수
 * @param querySnapshot Firebase 쿼리 스냅샷
 * @returns 포커스 사이클 배열
 */
function mapDocumentsToCycles(querySnapshot: any): FocusCycle[] {
  return querySnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return mapDocumentToCycle(doc.id, data);
  });
}

/**
 * 포커스 사이클 저장 함수
 * @param cycle 저장할 사이클
 * @returns 생성된 문서 ID
 */
export async function saveCycle(cycle: FocusCycle): Promise<string> {
  try {
    const cycleData = {
      ...cycle,
      startTime: cycle.startTime.toISOString(),
      endTime: cycle.endTime.toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cycleData);
    return docRef.id;
  } catch (error) {
    console.error('포커스 사이클 저장 실패:', error);
    throw new Error(`포커스 사이클 저장에 실패했습니다: ${error}`);
  }
}

/**
 * 특정 날짜의 포커스 사이클 조회 함수
 * @param date 날짜 (YYYY-MM-DD 형식)
 * @returns 해당 날짜의 사이클 배열
 */
export async function getCyclesByDate(date: string): Promise<FocusCycle[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '==', date),
      orderBy('startTime', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return mapDocumentsToCycles(querySnapshot);
  } catch (error) {
    console.error('날짜별 포커스 사이클 조회 실패:', error);
    throw new Error(`날짜별 포커스 사이클 조회에 실패했습니다: ${error}`);
  }
}

/**
 * 모든 포커스 사이클 조회 함수
 * @param limitCount 조회할 최대 개수
 * @returns 사이클 배열
 */
export async function getAllCycles(limitCount: number = 100): Promise<FocusCycle[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return mapDocumentsToCycles(querySnapshot);
  } catch (error) {
    console.error('전체 포커스 사이클 조회 실패:', error);
    throw new Error(`전체 포커스 사이클 조회에 실패했습니다: ${error}`);
  }
}

/**
 * 포커스 사이클 업데이트 함수
 * @param id 사이클 ID
 * @param updates 업데이트할 필드들
 */
export async function updateCycle(id: string, updates: Partial<FocusCycle>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`포커스 사이클 ID ${id}가 존재하지 않습니다.`);
    }

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Date 객체를 ISO 문자열로 변환
    if (updates.startTime instanceof Date) {
      updateData.startTime = updates.startTime.toISOString();
    }
    if (updates.endTime instanceof Date) {
      updateData.endTime = updates.endTime.toISOString();
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('포커스 사이클 업데이트 실패:', error);
    throw new Error(`포커스 사이클 업데이트에 실패했습니다: ${error}`);
  }
}

/**
 * 포커스 사이클 삭제 함수
 * @param id 삭제할 사이클 ID
 */
export async function deleteCycle(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('포커스 사이클 삭제 실패:', error);
    throw new Error(`포커스 사이클 삭제에 실패했습니다: ${error}`);
  }
}

/**
 * 특정 ID의 포커스 사이클 조회 함수
 * @param id 사이클 ID
 * @returns 사이클 또는 null
 */
export async function getCycleById(id: string): Promise<FocusCycle | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return mapDocumentToCycle(docSnap.id, data);
  } catch (error) {
    console.error('포커스 사이클 조회 실패:', error);
    throw new Error(`포커스 사이클 조회에 실패했습니다: ${error}`);
  }
}

/**
 * 날짜 범위로 포커스 사이클 조회 함수
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 해당 범위의 사이클 배열
 */
export async function getCyclesByDateRange(startDate: string, endDate: string): Promise<FocusCycle[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return mapDocumentsToCycles(querySnapshot);
  } catch (error) {
    console.error('날짜 범위 포커스 사이클 조회 실패:', error);
    throw new Error(`날짜 범위 포커스 사이클 조회에 실패했습니다: ${error}`);
  }
}

/**
 * Firebase Repository 객체 (함수형)
 */
export const firebaseFocusCycleRepository: FocusCycleRepository = {
  saveCycle,
  getCyclesByDate,
  getAllCycles,
  updateCycle,
  deleteCycle
};
