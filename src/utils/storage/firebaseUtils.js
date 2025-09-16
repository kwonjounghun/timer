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
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export const COLLECTIONS = {
  FOCUS_CYCLES: 'focus_cycles',
  DAILY_CHECKLISTS: 'daily_checklists',
  LINKS: 'links',
  CONCEPTMAP: 'conceptmap',
  TODOS: 'todos',
  SETTINGS: 'settings',
  RETROSPECTIVES: 'retrospectives'
};

export const testFirebaseConnection = async () => {
  try {
    console.log('Firebase 연결 테스트 시작...');
    console.log('DB 인스턴스:', db);

    const q = query(collection(db, COLLECTIONS.FOCUS_CYCLES), limit(1));
    const querySnapshot = await getDocs(q);

    console.log('Firebase 연결 테스트 성공:', querySnapshot);
    return {
      success: true,
      message: 'Firebase 연결 성공',
      data: querySnapshot.docs.length,
      docs: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  } catch (error) {
    console.error('Firebase 연결 테스트 실패:', error);
    return {
      success: false,
      message: error.message,
      error: error.code || 'UNKNOWN_ERROR',
      fullError: error
    };
  }
};

export const simpleFirebaseTest = async () => {
  try {
    console.log('간단한 Firebase 테스트 시작...');

    const testCollection = collection(db, 'test_collection');
    console.log('컬렉션 참조 생성 성공:', testCollection);

    return {
      success: true,
      message: 'Firebase 기본 연결 성공',
      collection: testCollection.id
    };
  } catch (error) {
    console.error('간단한 Firebase 테스트 실패:', error);
    return {
      success: false,
      message: error.message,
      error: error.code || 'UNKNOWN_ERROR'
    };
  }
};

export const createDocument = async (collectionName, data) => {
  try {
    // Date 객체를 Timestamp로 변환하고 id 필드 제거
    const processedData = { ...data };
    delete processedData.id; // Firebase가 자동 생성한 문서 ID를 사용하도록 id 필드 제거
    
    if (processedData.completedAt instanceof Date) {
      processedData.completedAt = serverTimestamp();
    }
    if (processedData.createdAt instanceof Date) {
      processedData.createdAt = serverTimestamp();
    }
    if (processedData.updatedAt instanceof Date) {
      processedData.updatedAt = serverTimestamp();
    }

    const docRef = await addDoc(collection(db, collectionName), {
      ...processedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`${collectionName} 문서 생성 실패:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, updateData) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Date 객체를 Timestamp로 변환
      const processedUpdateData = { ...updateData };
      if (processedUpdateData.completedAt instanceof Date) {
        processedUpdateData.completedAt = serverTimestamp();
      }
      if (processedUpdateData.createdAt instanceof Date) {
        processedUpdateData.createdAt = serverTimestamp();
      }
      if (processedUpdateData.updatedAt instanceof Date) {
        processedUpdateData.updatedAt = serverTimestamp();
      }

      await updateDoc(docRef, {
        ...processedUpdateData,
        updatedAt: serverTimestamp()
      });
    } else {
      // 할일의 경우 존재하지 않으면 에러를 던짐 (중복 생성 방지)
      if (collectionName === COLLECTIONS.TODOS) {
        throw new Error(`할일 ID ${docId}가 존재하지 않습니다.`);
      }
      
      // 다른 컬렉션의 경우 기존 로직 유지
      console.warn(`${collectionName} 문서 ${docId}가 존재하지 않습니다. 새로 생성합니다.`);
      await setDoc(docRef, {
        ...updateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error(`${collectionName} 문서 업데이트 실패:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`${collectionName} 문서 삭제 실패:`, error);
    throw error;
  }
};

export const getDocuments = async (collectionName, queryOptions = {}) => {
  try {
    let q = collection(db, collectionName);

    if (queryOptions.where) {
      q = query(q, where(queryOptions.where.field, queryOptions.where.operator, queryOptions.where.value));
    }

    if (queryOptions.orderBy) {
      q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'desc'));
    }

    if (queryOptions.limit) {
      q = query(q, limit(queryOptions.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Firebase 문서 ID를 우선시하고, 데이터의 id 필드는 무시
      return { 
        id: doc.id,  // Firebase 문서 ID가 실제 ID
        ...data,
        // 데이터에 id 필드가 있어도 Firebase 문서 ID로 덮어씀
        id: doc.id
      };
    });
  } catch (error) {
    console.error(`${collectionName} 문서 조회 실패:`, error);
    throw error;
  }
};