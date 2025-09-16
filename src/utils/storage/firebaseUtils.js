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
  SETTINGS: 'settings'
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
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
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
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } else {
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`${collectionName} 문서 조회 실패:`, error);
    throw error;
  }
};