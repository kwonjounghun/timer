import { getStorageType } from '../storageType';
import { checkPermission, localStorageUtils, STORAGE_KEYS } from './storageUtils';
import { COLLECTIONS, createDocument, updateDocument, getDocuments } from './firebaseUtils';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const localStorageApi = {
  saveDailyChecklist: async (checklistData) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];
    const existingIndex = checklists.findIndex(checklist => checklist.date === checklistData.date);

    if (existingIndex !== -1) {
      checklists[existingIndex] = {
        ...checklists[existingIndex],
        ...checklistData,
        updatedAt: new Date().toISOString()
      };
      localStorageUtils.setItem(STORAGE_KEYS.DAILY_CHECKLISTS, checklists);
      return checklists[existingIndex].id;
    } else {
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

  getDailyChecklistByDate: async (date) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];
    return checklists.find(checklist => checklist.date === date) || null;
  },

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

  getAllDailyChecklists: async (limit = 100) => {
    const checklists = localStorageUtils.getItem(STORAGE_KEYS.DAILY_CHECKLISTS) || [];
    return checklists
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return 1;
        if (isNaN(bTime)) return -1;
        return bTime - aTime;
      })
      .slice(0, limit);
  }
};

const firebaseApi = {
  saveDailyChecklist: async (checklistData) => {
    try {
      const existingChecklist = await firebaseApi.getDailyChecklistByDate(checklistData.date);

      if (existingChecklist) {
        const docRef = doc(db, COLLECTIONS.DAILY_CHECKLISTS, existingChecklist.id);
        await updateDoc(docRef, {
          ...checklistData,
          updatedAt: serverTimestamp()
        });
        return existingChecklist.id;
      } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.DAILY_CHECKLISTS), {
          ...checklistData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('일일 체크리스트 저장 실패:', error);
      throw error;
    }
  },

  getDailyChecklistByDate: async (date) => {
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
  },

  updateDailyChecklist: async (checklistId, updateData) => {
    await updateDocument(COLLECTIONS.DAILY_CHECKLISTS, checklistId, updateData);
    return true;
  },

  getAllDailyChecklists: async (limitCount = 100) => {
    return await getDocuments(COLLECTIONS.DAILY_CHECKLISTS, {
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: limitCount
    });
  }
};

export const checklistStorage = {
  saveDailyChecklist: async (checklistData) => {
    if (!checkPermission('일일 체크리스트 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.saveDailyChecklist(checklistData);
    } else {
      return await localStorageApi.saveDailyChecklist(checklistData);
    }
  },

  getDailyChecklistByDate: async (date) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getDailyChecklistByDate(date);
    } else {
      return await localStorageApi.getDailyChecklistByDate(date);
    }
  },

  updateDailyChecklist: async (checklistId, updateData) => {
    if (!checkPermission('일일 체크리스트 수정')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.updateDailyChecklist(checklistId, updateData);
    } else {
      return await localStorageApi.updateDailyChecklist(checklistId, updateData);
    }
  },

  getAllDailyChecklists: async (limit = 100) => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getAllDailyChecklists(limit);
    } else {
      return await localStorageApi.getAllDailyChecklists(limit);
    }
  }
};