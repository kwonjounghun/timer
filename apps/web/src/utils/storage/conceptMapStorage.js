import { getStorageType } from '../storageType';
import { checkPermission, localStorageUtils, STORAGE_KEYS } from './storageUtils';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument, getDocuments } from './firebaseUtils';

const localStorageApi = {
  saveConceptMap: async (conceptMapData) => {
    const conceptMaps = localStorageUtils.getItem(STORAGE_KEYS.CONCEPTMAP) || [];
    const newConceptMap = {
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
  }
};

const firebaseApi = {
  saveConceptMap: async (conceptMapData) => {
    return await createDocument(COLLECTIONS.CONCEPTMAP, conceptMapData);
  },

  getConceptMaps: async () => {
    return await getDocuments(COLLECTIONS.CONCEPTMAP, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  },

  updateConceptMap: async (conceptMapId, updateData) => {
    await updateDocument(COLLECTIONS.CONCEPTMAP, conceptMapId, updateData);
    return true;
  },

  deleteConceptMap: async (conceptMapId) => {
    await deleteDocument(COLLECTIONS.CONCEPTMAP, conceptMapId);
    return true;
  }
};

export const conceptMapStorage = {
  saveConceptMap: async (conceptMapData) => {
    if (!checkPermission('컨셉맵 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.saveConceptMap(conceptMapData);
    } else {
      return await localStorageApi.saveConceptMap(conceptMapData);
    }
  },

  getConceptMaps: async () => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getConceptMaps();
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
      return await firebaseApi.updateConceptMap(conceptMapId, updateData);
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
      return await firebaseApi.deleteConceptMap(conceptMapId);
    } else {
      return await localStorageApi.deleteConceptMap(conceptMapId);
    }
  }
};