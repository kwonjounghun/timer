import { getStorageType } from '../storageType';
import { checkPermission, localStorageUtils, STORAGE_KEYS } from './storageUtils';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument, getDocuments } from './firebaseUtils';

// 로컬스토리지에 회고 키 추가
const RETROSPECTIVE_STORAGE_KEY = 'daily_retrospectives';

const localStorageApi = {
  saveRetrospective: async (retrospectiveData) => {
    const retrospectives = localStorageUtils.getItem(RETROSPECTIVE_STORAGE_KEY) || [];
    const existingIndex = retrospectives.findIndex(retro => retro.date === retrospectiveData.date);

    if (existingIndex !== -1) {
      // 같은 날짜 데이터가 있으면 업데이트
      retrospectives[existingIndex] = {
        ...retrospectives[existingIndex],
        ...retrospectiveData,
        updatedAt: new Date().toISOString()
      };
      localStorageUtils.setItem(RETROSPECTIVE_STORAGE_KEY, retrospectives);
      return retrospectives[existingIndex].id;
    } else {
      // 새로운 데이터 생성
      const newRetrospective = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...retrospectiveData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      retrospectives.push(newRetrospective);
      localStorageUtils.setItem(RETROSPECTIVE_STORAGE_KEY, retrospectives);
      return newRetrospective.id;
    }
  },

  getRetrospectiveByDate: async (date) => {
    const retrospectives = localStorageUtils.getItem(RETROSPECTIVE_STORAGE_KEY) || [];
    return retrospectives.find(retro => retro.date === date) || null;
  },

  getAllRetrospectives: async (limit = 100) => {
    const retrospectives = localStorageUtils.getItem(RETROSPECTIVE_STORAGE_KEY) || [];
    return retrospectives
      .sort((a, b) => {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return 1;
        if (isNaN(bTime)) return -1;
        return bTime - aTime; // 최신순
      })
      .slice(0, limit);
  },

  updateRetrospective: async (retroId, updateData) => {
    const retrospectives = localStorageUtils.getItem(RETROSPECTIVE_STORAGE_KEY) || [];
    const index = retrospectives.findIndex(retro => retro.id === retroId);
    if (index !== -1) {
      retrospectives[index] = {
        ...retrospectives[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      localStorageUtils.setItem(RETROSPECTIVE_STORAGE_KEY, retrospectives);
      return true;
    }
    return false;
  },

  deleteRetrospective: async (retroId) => {
    const retrospectives = localStorageUtils.getItem(RETROSPECTIVE_STORAGE_KEY) || [];
    const filteredRetrospectives = retrospectives.filter(retro => retro.id !== retroId);
    localStorageUtils.setItem(RETROSPECTIVE_STORAGE_KEY, filteredRetrospectives);
    return true;
  }
};

const firebaseApi = {
  saveRetrospective: async (retrospectiveData) => {
    try {
      // 같은 날짜의 기존 회고가 있는지 확인
      const existingRetrospective = await firebaseApi.getRetrospectiveByDate(retrospectiveData.date);

      if (existingRetrospective) {
        // 기존 데이터 업데이트
        await updateDocument(COLLECTIONS.RETROSPECTIVES, existingRetrospective.id, retrospectiveData);
        return existingRetrospective.id;
      } else {
        // 새로운 데이터 생성
        return await createDocument(COLLECTIONS.RETROSPECTIVES, retrospectiveData);
      }
    } catch (error) {
      console.error('회고 저장 실패:', error);
      throw error;
    }
  },

  getRetrospectiveByDate: async (date) => {
    try {
      const retrospectives = await getDocuments(COLLECTIONS.RETROSPECTIVES, {
        where: { field: 'date', operator: '==', value: date },
        limit: 1
      });
      return retrospectives.length > 0 ? retrospectives[0] : null;
    } catch (error) {
      console.error('날짜별 회고 조회 실패:', error);
      throw error;
    }
  },

  getAllRetrospectives: async (limitCount = 100) => {
    return await getDocuments(COLLECTIONS.RETROSPECTIVES, {
      orderBy: { field: 'date', direction: 'desc' },
      limit: limitCount
    });
  },

  updateRetrospective: async (retroId, updateData) => {
    await updateDocument(COLLECTIONS.RETROSPECTIVES, retroId, updateData);
    return true;
  },

  deleteRetrospective: async (retroId) => {
    await deleteDocument(COLLECTIONS.RETROSPECTIVES, retroId);
    return true;
  }
};

// Firebase 컬렉션 이름 추가
const RETROSPECTIVE_COLLECTION = 'retrospectives';

export const retrospectiveStorage = {
  saveRetrospective: async (retrospectiveData) => {
    if (!checkPermission('회고 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.saveRetrospective(retrospectiveData);
    } else {
      return await localStorageApi.saveRetrospective(retrospectiveData);
    }
  },

  getRetrospectiveByDate: async (date) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getRetrospectiveByDate(date);
    } else {
      return await localStorageApi.getRetrospectiveByDate(date);
    }
  },

  getAllRetrospectives: async (limit = 100) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getAllRetrospectives(limit);
    } else {
      return await localStorageApi.getAllRetrospectives(limit);
    }
  },

  updateRetrospective: async (retroId, updateData) => {
    if (!checkPermission('회고 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.updateRetrospective(retroId, updateData);
    } else {
      return await localStorageApi.updateRetrospective(retroId, updateData);
    }
  },

  deleteRetrospective: async (retroId) => {
    if (!checkPermission('회고 삭제')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.deleteRetrospective(retroId);
    } else {
      return await localStorageApi.deleteRetrospective(retroId);
    }
  }
};