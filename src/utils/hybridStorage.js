import { getStorageType } from './storageType';
import { 
  saveFocusCycle as firebaseSaveFocusCycle,
  getFocusCyclesByDate as firebaseGetFocusCyclesByDate,
  getAllFocusCycles as firebaseGetAllFocusCycles,
  updateFocusCycle as firebaseUpdateFocusCycle,
  deleteFocusCycle as firebaseDeleteFocusCycle,
  saveDailyChecklist as firebaseSaveDailyChecklist,
  getDailyChecklistByDate as firebaseGetDailyChecklistByDate,
  updateDailyChecklist as firebaseUpdateDailyChecklist,
  getAllDailyChecklists as firebaseGetAllDailyChecklists
} from './firebaseApi';

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
  FOCUS_CYCLES: 'focus_cycles',
  DAILY_CHECKLISTS: 'daily_checklists'
};

// 로컬스토리지 유틸리티 함수들
const localStorageUtils = {
  // 데이터 저장
  setItem: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('로컬스토리지 저장 실패:', error);
      return false;
    }
  },

  // 데이터 조회
  getItem: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('로컬스토리지 조회 실패:', error);
      return null;
    }
  },

  // 데이터 삭제
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('로컬스토리지 삭제 실패:', error);
      return false;
    }
  }
};

// 로컬스토리지 API 함수들
const localStorageApi = {
  // 포커스 사이클 저장
  saveFocusCycle: async (cycleData) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    const newCycle = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...cycleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    cycles.push(newCycle);
    localStorageUtils.setItem(STORAGE_KEYS.FOCUS_CYCLES, cycles);
    return newCycle.id;
  },

  // 날짜별 포커스 사이클 조회
  getFocusCyclesByDate: async (date) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    return cycles.filter(cycle => cycle.date === date);
  },

  // 모든 포커스 사이클 조회
  getAllFocusCycles: async (limit = 100) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    return cycles
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  // 포커스 사이클 업데이트
  updateFocusCycle: async (cycleId, updateData) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    const index = cycles.findIndex(cycle => cycle.id === cycleId);
    if (index !== -1) {
      cycles[index] = {
        ...cycles[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      localStorageUtils.setItem(STORAGE_KEYS.FOCUS_CYCLES, cycles);
      return true;
    }
    return false;
  },

  // 포커스 사이클 삭제
  deleteFocusCycle: async (cycleId) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    const filteredCycles = cycles.filter(cycle => cycle.id !== cycleId);
    localStorageUtils.setItem(STORAGE_KEYS.FOCUS_CYCLES, filteredCycles);
    return true;
  },

  // 일일 체크리스트 저장
  saveDailyChecklist: async (checklistData) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];
    const newChecklist = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...checklistData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    checklists.push(newChecklist);
    localStorageUtils.setItem(STORAGE_KEYS.DAILY_CHECKLISTS, checklists);
    return newChecklist.id;
  },

  // 날짜별 일일 체크리스트 조회
  getDailyChecklistByDate: async (date) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];
    return checklists.find(checklist => checklist.date === date) || null;
  },

  // 일일 체크리스트 업데이트
  updateDailyChecklist: async (checklistId, updateData) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];
    const index = checklists.findIndex(checklist => checklist.id === checklistId);
    if (index !== -1) {
      checklists[index] = {
        ...checklists[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      localStorageUtils.setItem(STORAGE_KEYS.DAILY_CHECKLISTS, checklists);
      return true;
    }
    return false;
  },

  // 모든 일일 체크리스트 조회
  getAllDailyChecklists: async (limit = 100) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];
    return checklists
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
};

// 하이브리드 스토리지 API - 스토리지 타입에 따라 적절한 API 호출
export const hybridStorage = {
  // 포커스 사이클 저장
  saveFocusCycle: async (cycleData) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseSaveFocusCycle(cycleData);
    } else {
      return await localStorageApi.saveFocusCycle(cycleData);
    }
  },

  // 날짜별 포커스 사이클 조회
  getFocusCyclesByDate: async (date) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseGetFocusCyclesByDate(date);
    } else {
      return await localStorageApi.getFocusCyclesByDate(date);
    }
  },

  // 모든 포커스 사이클 조회
  getAllFocusCycles: async (limit = 100) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseGetAllFocusCycles(limit);
    } else {
      return await localStorageApi.getAllFocusCycles(limit);
    }
  },

  // 포커스 사이클 업데이트
  updateFocusCycle: async (cycleId, updateData) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseUpdateFocusCycle(cycleId, updateData);
    } else {
      return await localStorageApi.updateFocusCycle(cycleId, updateData);
    }
  },

  // 포커스 사이클 삭제
  deleteFocusCycle: async (cycleId) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseDeleteFocusCycle(cycleId);
    } else {
      return await localStorageApi.deleteFocusCycle(cycleId);
    }
  },

  // 일일 체크리스트 저장
  saveDailyChecklist: async (checklistData) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseSaveDailyChecklist(checklistData);
    } else {
      return await localStorageApi.saveDailyChecklist(checklistData);
    }
  },

  // 날짜별 일일 체크리스트 조회
  getDailyChecklistByDate: async (date) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseGetDailyChecklistByDate(date);
    } else {
      return await localStorageApi.getDailyChecklistByDate(date);
    }
  },

  // 일일 체크리스트 업데이트
  updateDailyChecklist: async (checklistId, updateData) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseUpdateDailyChecklist(checklistId, updateData);
    } else {
      return await localStorageApi.updateDailyChecklist(checklistId, updateData);
    }
  },

  // 모든 일일 체크리스트 조회
  getAllDailyChecklists: async (limit = 100) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseGetAllDailyChecklists(limit);
    } else {
      return await localStorageApi.getAllDailyChecklists(limit);
    }
  },

  // 스토리지 타입 정보
  getStorageInfo: () => {
    return getStorageType();
  }
};
