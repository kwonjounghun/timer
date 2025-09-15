import { getStorageType } from './storageType';
import { auth } from '../config/firebase';
import {
  saveFocusCycle as firebaseSaveFocusCycle,
  getFocusCyclesByDate as firebaseGetFocusCyclesByDate,
  getAllFocusCycles as firebaseGetAllFocusCycles,
  updateFocusCycle as firebaseUpdateFocusCycle,
  deleteFocusCycle as firebaseDeleteFocusCycle,
  saveDailyChecklist as firebaseSaveDailyChecklist,
  getDailyChecklistByDate as firebaseGetDailyChecklistByDate,
  updateDailyChecklist as firebaseUpdateDailyChecklist,
  getAllDailyChecklists as firebaseGetAllDailyChecklists,
  saveLink as firebaseSaveLink,
  getLinks as firebaseGetLinks,
  updateLink as firebaseUpdateLink,
  deleteLink as firebaseDeleteLink,
  saveConceptMap as firebaseSaveConceptMap,
  getConceptMaps as firebaseGetConceptMaps,
  updateConceptMap as firebaseUpdateConceptMap,
  deleteConceptMap as firebaseDeleteConceptMap,
  saveTodo as firebaseSaveTodo,
  getTodos as firebaseGetTodos,
  updateTodo as firebaseUpdateTodo,
  deleteTodo as firebaseDeleteTodo
} from './firebaseApi';

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
  FOCUS_CYCLES: 'focus_cycles',
  DAILY_CHECKLISTS: 'daily_checklists',
  LINKS: 'linkItems',
  CONCEPTMAP: 'conceptmap-links',
  TODOS: 'todoItems'
};

// 권한 확인 함수
const checkPermission = (operation) => {
  const storageType = getStorageType();

  // 로컬스토리지 모드에서는 항상 허용
  if (storageType === 'localStorage') {
    return true;
  }

  // Firebase 모드에서는 인증된 사용자만 허용
  if (storageType === 'firebase') {
    const user = auth.currentUser;
    if (!user) {
      console.warn(`${operation} 권한이 없습니다: 뷰어 모드에서는 조회만 가능합니다.`);
      return false;
    }
    return true;
  }

  return false;
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
      // ID가 이미 있으면 사용, 없으면 새로 생성
      id: cycleData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        // 유효하지 않은 날짜가 있으면 뒤로 정렬
        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return 1;
        if (isNaN(bTime)) return -1;
        return bTime - aTime;
      })
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

  // 일일 체크리스트 저장 (기존 데이터가 있으면 업데이트, 없으면 새로 생성)
  saveDailyChecklist: async (checklistData) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];

    // 같은 날짜의 기존 체크리스트 찾기
    const existingIndex = checklists.findIndex(checklist => checklist.date === checklistData.date);

    if (existingIndex !== -1) {
      // 기존 데이터 업데이트
      checklists[existingIndex] = {
        ...checklists[existingIndex],
        ...checklistData,
        updatedAt: new Date().toISOString()
      };
      localStorageUtils.setItem(STORAGE_KEYS.DAILY_CHECKLISTS, checklists);
      return checklists[existingIndex].id;
    } else {
      // 새로운 데이터 생성
      const newChecklist = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...checklistData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      checklists.push(newChecklist);
      localStorageUtils.setItem(STORAGE_KEYS.DAILY_CHECKLISTS, checklists);
      return newChecklist.id;
    }
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
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        // 유효하지 않은 날짜가 있으면 뒤로 정렬
        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return 1;
        if (isNaN(bTime)) return -1;
        return bTime - aTime;
      })
      .slice(0, limit);
  },

  // 링크 관리 API
  saveLink: async (linkData) => {
    const links = localStorageUtils.getItem(STORAGE_KEYS.LINKS) || [];
    const newLink = {
      // ID가 이미 있으면 사용, 없으면 새로 생성
      id: linkData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...linkData,
      createdAt: new Date(),
      readAt: linkData.isRead ? new Date() : undefined
    };
    links.push(newLink);
    localStorageUtils.setItem(STORAGE_KEYS.LINKS, links);
    return newLink.id;
  },

  getLinks: async () => {
    return localStorageUtils.getItem(STORAGE_KEYS.LINKS) || [];
  },

  updateLink: async (linkId, updateData) => {
    const links = localStorageUtils.getItem(STORAGE_KEYS.LINKS) || [];
    const index = links.findIndex(link => link.id === linkId);
    if (index !== -1) {
      links[index] = {
        ...links[index],
        ...updateData,
        readAt: updateData.isRead && !links[index].isRead ? new Date() : links[index].readAt
      };
      localStorageUtils.setItem(STORAGE_KEYS.LINKS, links);
      return true;
    }
    return false;
  },

  deleteLink: async (linkId) => {
    const links = localStorageUtils.getItem(STORAGE_KEYS.LINKS) || [];
    const filteredLinks = links.filter(link => link.id !== linkId);
    localStorageUtils.setItem(STORAGE_KEYS.LINKS, filteredLinks);
    return true;
  },

  // 컨셉맵 관리 API
  saveConceptMap: async (conceptMapData) => {
    const conceptMaps = localStorageUtils.getItem(STORAGE_KEYS.CONCEPTMAP) || [];
    const newConceptMap = {
      // ID가 이미 있으면 사용, 없으면 새로 생성
      id: conceptMapData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...conceptMapData,
      createdAt: new Date()
    };
    conceptMaps.push(newConceptMap);
    localStorageUtils.setItem(STORAGE_KEYS.CONCEPTMAP, conceptMaps);
    return newConceptMap.id;
  },

  getConceptMaps: async () => {
    return localStorageUtils.getItem(STORAGE_KEYS.CONCEPTMAP) || [];
  },

  updateConceptMap: async (conceptMapId, updateData) => {
    const conceptMaps = localStorageUtils.getItem(STORAGE_KEYS.CONCEPTMAP) || [];
    const index = conceptMaps.findIndex(conceptMap => conceptMap.id === conceptMapId);
    if (index !== -1) {
      conceptMaps[index] = {
        ...conceptMaps[index],
        ...updateData
      };
      localStorageUtils.setItem(STORAGE_KEYS.CONCEPTMAP, conceptMaps);
      return true;
    }
    return false;
  },

  deleteConceptMap: async (conceptMapId) => {
    const conceptMaps = localStorageUtils.getItem(STORAGE_KEYS.CONCEPTMAP) || [];
    const filteredConceptMaps = conceptMaps.filter(conceptMap => conceptMap.id !== conceptMapId);
    localStorageUtils.setItem(STORAGE_KEYS.CONCEPTMAP, filteredConceptMaps);
    return true;
  },

  // 할일 관리 API
  saveTodo: async (todoData) => {
    const todos = localStorageUtils.getItem(STORAGE_KEYS.TODOS) || [];
    const newTodo = {
      // ID가 이미 있으면 사용, 없으면 새로 생성
      id: todoData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...todoData,
      createdAt: todoData.createdAt || new Date(),
      updatedAt: new Date()
    };
    todos.push(newTodo);
    localStorageUtils.setItem(STORAGE_KEYS.TODOS, todos);
    return newTodo.id;
  },

  getTodos: async () => {
    return localStorageUtils.getItem(STORAGE_KEYS.TODOS) || [];
  },

  updateTodo: async (todoId, updateData) => {
    const todos = localStorageUtils.getItem(STORAGE_KEYS.TODOS) || [];
    const index = todos.findIndex(todo => todo.id === todoId);
    if (index !== -1) {
      todos[index] = {
        ...todos[index],
        ...updateData,
        updatedAt: new Date()
      };
      localStorageUtils.setItem(STORAGE_KEYS.TODOS, todos);
      return true;
    }
    return false;
  },

  deleteTodo: async (todoId) => {
    const todos = localStorageUtils.getItem(STORAGE_KEYS.TODOS) || [];
    const filteredTodos = todos.filter(todo => todo.id !== todoId);
    localStorageUtils.setItem(STORAGE_KEYS.TODOS, filteredTodos);
    return true;
  }
};

// 하이브리드 스토리지 API - 스토리지 타입에 따라 적절한 API 호출
export const hybridStorage = {
  // 포커스 사이클 저장
  saveFocusCycle: async (cycleData) => {
    if (!checkPermission('포커스 사이클 저장')) {
      throw new Error('뷰어 모드에서는 저장할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

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
    if (!checkPermission('포커스 사이클 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseUpdateFocusCycle(cycleId, updateData);
    } else {
      return await localStorageApi.updateFocusCycle(cycleId, updateData);
    }
  },

  // 포커스 사이클 삭제
  deleteFocusCycle: async (cycleId) => {
    if (!checkPermission('포커스 사이클 삭제')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseDeleteFocusCycle(cycleId);
    } else {
      return await localStorageApi.deleteFocusCycle(cycleId);
    }
  },

  // 일일 체크리스트 저장
  saveDailyChecklist: async (checklistData) => {
    if (!checkPermission('일일 체크리스트 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

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
    if (!checkPermission('일일 체크리스트 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

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

  // 링크 관리
  saveLink: async (linkData) => {
    if (!checkPermission('링크 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseSaveLink(linkData);
    } else {
      return await localStorageApi.saveLink(linkData);
    }
  },

  getLinks: async () => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseGetLinks();
    } else {
      return await localStorageApi.getLinks();
    }
  },

  updateLink: async (linkId, updateData) => {
    if (!checkPermission('링크 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseUpdateLink(linkId, updateData);
    } else {
      return await localStorageApi.updateLink(linkId, updateData);
    }
  },

  deleteLink: async (linkId) => {
    if (!checkPermission('링크 삭제')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseDeleteLink(linkId);
    } else {
      return await localStorageApi.deleteLink(linkId);
    }
  },

  // 컨셉맵 관리
  saveConceptMap: async (conceptMapData) => {
    if (!checkPermission('컨셉맵 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseSaveConceptMap(conceptMapData);
    } else {
      return await localStorageApi.saveConceptMap(conceptMapData);
    }
  },

  getConceptMaps: async () => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseGetConceptMaps();
    } else {
      return await localStorageApi.getConceptMaps();
    }
  },

  updateConceptMap: async (conceptMapId, updateData) => {
    if (!checkPermission('컨셉맵 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseUpdateConceptMap(conceptMapId, updateData);
    } else {
      return await localStorageApi.updateConceptMap(conceptMapId, updateData);
    }
  },

  deleteConceptMap: async (conceptMapId) => {
    if (!checkPermission('컨셉맵 삭제')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseDeleteConceptMap(conceptMapId);
    } else {
      return await localStorageApi.deleteConceptMap(conceptMapId);
    }
  },

  // 할일 관리
  saveTodo: async (todoData) => {
    if (!checkPermission('할일 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseSaveTodo(todoData);
    } else {
      return await localStorageApi.saveTodo(todoData);
    }
  },

  getTodos: async () => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseGetTodos();
    } else {
      return await localStorageApi.getTodos();
    }
  },

  updateTodo: async (todoId, updateData) => {
    if (!checkPermission('할일 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseUpdateTodo(todoId, updateData);
    } else {
      return await localStorageApi.updateTodo(todoId, updateData);
    }
  },

  deleteTodo: async (todoId) => {
    if (!checkPermission('할일 삭제')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseDeleteTodo(todoId);
    } else {
      return await localStorageApi.deleteTodo(todoId);
    }
  },

  // 스토리지 타입 정보
  getStorageInfo: () => {
    return getStorageType();
  }
};
