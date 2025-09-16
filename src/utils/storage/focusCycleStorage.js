import { getStorageType } from '../storageType';
import { checkPermission, localStorageUtils, STORAGE_KEYS } from './storageUtils';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument, getDocuments } from './firebaseUtils';

const localStorageApi = {
  saveFocusCycle: async (cycleData) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    const newCycle = {
      id: cycleData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...cycleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    cycles.push(newCycle);
    localStorageUtils.setItem(STORAGE_KEYS.FOCUS_CYCLES, cycles);
    return newCycle.id;
  },

  getFocusCyclesByDate: async (date) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    return cycles.filter(cycle => cycle.date === date);
  },

  getAllFocusCycles: async (limit = 100) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    return cycles
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return 1;
        if (isNaN(bTime)) return -1;
        return bTime - aTime;
      })
      .slice(0, limit);
  },

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

  deleteFocusCycle: async (cycleId) => {
    const cycles = localStorageUtils.getItem(STORAGE_KEYS.FOCUS_CYCLES) || [];
    const filteredCycles = cycles.filter(cycle => cycle.id !== cycleId);
    localStorageUtils.setItem(STORAGE_KEYS.FOCUS_CYCLES, filteredCycles);
    return true;
  }
};

const firebaseApi = {
  saveFocusCycle: async (cycleData) => {
    return await createDocument(COLLECTIONS.FOCUS_CYCLES, cycleData);
  },

  getFocusCyclesByDate: async (date) => {
    return await getDocuments(COLLECTIONS.FOCUS_CYCLES, {
      where: { field: 'date', operator: '==', value: date },
      orderBy: { field: 'createdAt', direction: 'asc' }
    });
  },

  getAllFocusCycles: async (limitCount = 100) => {
    return await getDocuments(COLLECTIONS.FOCUS_CYCLES, {
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: limitCount
    });
  },

  updateFocusCycle: async (cycleId, updateData) => {
    await updateDocument(COLLECTIONS.FOCUS_CYCLES, cycleId, updateData);
    return true;
  },

  deleteFocusCycle: async (cycleId) => {
    await deleteDocument(COLLECTIONS.FOCUS_CYCLES, cycleId);
    return true;
  }
};

export const focusCycleStorage = {
  saveFocusCycle: async (cycleData) => {
    if (!checkPermission('포커스 사이클 저장')) {
      throw new Error('뷰어 모드에서는 저장할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.saveFocusCycle(cycleData);
    } else {
      return await localStorageApi.saveFocusCycle(cycleData);
    }
  },

  getFocusCyclesByDate: async (date) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getFocusCyclesByDate(date);
    } else {
      return await localStorageApi.getFocusCyclesByDate(date);
    }
  },

  getAllFocusCycles: async (limit = 100) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getAllFocusCycles(limit);
    } else {
      return await localStorageApi.getAllFocusCycles(limit);
    }
  },

  updateFocusCycle: async (cycleId, updateData) => {
    if (!checkPermission('포커스 사이클 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.updateFocusCycle(cycleId, updateData);
    } else {
      return await localStorageApi.updateFocusCycle(cycleId, updateData);
    }
  },

  deleteFocusCycle: async (cycleId) => {
    if (!checkPermission('포커스 사이클 삭제')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.deleteFocusCycle(cycleId);
    } else {
      return await localStorageApi.deleteFocusCycle(cycleId);
    }
  }
};