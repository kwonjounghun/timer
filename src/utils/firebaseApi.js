import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// 컬렉션 이름 상수
const COLLECTIONS = {
  FOCUS_CYCLES: 'focus_cycles',
  DAILY_CHECKLISTS: 'daily_checklists',
  SETTINGS: 'settings'
};

/**
 * 포커스 사이클을 Firestore에 저장
 * @param {Object} cycleData - 사이클 데이터
 * @returns {Promise<string>} 생성된 문서 ID
 */
export const saveFocusCycle = async (cycleData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.FOCUS_CYCLES), {
      ...cycleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('포커스 사이클 저장 실패:', error);
    throw error;
  }
};

/**
 * 특정 날짜의 포커스 사이클들을 조회
 * @param {string} date - 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise<Array>} 사이클 목록
 */
export const getFocusCyclesByDate = async (date) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.FOCUS_CYCLES),
      where('date', '==', date),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const cycles = [];
    
    querySnapshot.forEach((doc) => {
      cycles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return cycles;
  } catch (error) {
    console.error('포커스 사이클 조회 실패:', error);
    throw error;
  }
};

/**
 * 모든 포커스 사이클 조회
 * @param {number} limitCount - 조회할 최대 개수
 * @returns {Promise<Array>} 사이클 목록
 */
export const getAllFocusCycles = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.FOCUS_CYCLES),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const cycles = [];
    
    querySnapshot.forEach((doc) => {
      cycles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return cycles;
  } catch (error) {
    console.error('모든 포커스 사이클 조회 실패:', error);
    throw error;
  }
};

/**
 * 포커스 사이클 업데이트
 * @param {string} cycleId - 사이클 ID
 * @param {Object} updateData - 업데이트할 데이터
 * @returns {Promise<void>}
 */
export const updateFocusCycle = async (cycleId, updateData) => {
  try {
    const cycleRef = doc(db, COLLECTIONS.FOCUS_CYCLES, cycleId);
    await updateDoc(cycleRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('포커스 사이클 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 포커스 사이클 삭제
 * @param {string} cycleId - 사이클 ID
 * @returns {Promise<void>}
 */
export const deleteFocusCycle = async (cycleId) => {
  try {
    const cycleRef = doc(db, COLLECTIONS.FOCUS_CYCLES, cycleId);
    await deleteDoc(cycleRef);
  } catch (error) {
    console.error('포커스 사이클 삭제 실패:', error);
    throw error;
  }
};

/**
 * 일일 체크리스트 저장
 * @param {Object} checklistData - 체크리스트 데이터
 * @returns {Promise<string>} 생성된 문서 ID
 */
export const saveDailyChecklist = async (checklistData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DAILY_CHECKLISTS), {
      ...checklistData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('일일 체크리스트 저장 실패:', error);
    throw error;
  }
};

/**
 * 특정 날짜의 일일 체크리스트 조회
 * @param {string} date - 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise<Object|null>} 체크리스트 데이터
 */
export const getDailyChecklistByDate = async (date) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.DAILY_CHECKLISTS),
      where('date', '==', date),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('일일 체크리스트 조회 실패:', error);
    throw error;
  }
};

/**
 * 일일 체크리스트 업데이트
 * @param {string} checklistId - 체크리스트 ID
 * @param {Object} updateData - 업데이트할 데이터
 * @returns {Promise<void>}
 */
export const updateDailyChecklist = async (checklistId, updateData) => {
  try {
    const checklistRef = doc(db, COLLECTIONS.DAILY_CHECKLISTS, checklistId);
    await updateDoc(checklistRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('일일 체크리스트 업데이트 실패:', error);
    throw error;
  }
};

/**
 * Firebase 연결 테스트
 * @returns {Promise<boolean>} 연결 성공 여부
 */
export const testFirebaseConnection = async () => {
  try {
    console.log('Firebase 연결 테스트 시작...');
    console.log('DB 인스턴스:', db);
    
    // 간단한 테스트 쿼리 실행 (실시간 리스너 없이)
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

/**
 * 간단한 Firebase 연결 테스트 (실시간 리스너 없이)
 * @returns {Promise<Object>} 테스트 결과
 */
export const simpleFirebaseTest = async () => {
  try {
    console.log('간단한 Firebase 테스트 시작...');
    
    // 가장 기본적인 테스트: 컬렉션 참조 생성
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

/**
 * 컬렉션 초기화 (개발용)
 * @returns {Promise<void>}
 */
export const initializeCollections = async () => {
  try {
    // 테스트 데이터 생성
    const testCycle = {
      date: new Date().toISOString().split('T')[0],
      duration: 10,
      completed: true,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };
    
    await saveFocusCycle(testCycle);
    console.log('Firebase 컬렉션 초기화 완료');
  } catch (error) {
    console.error('Firebase 컬렉션 초기화 실패:', error);
    throw error;
  }
};
