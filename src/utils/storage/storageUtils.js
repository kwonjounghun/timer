import { getStorageType } from '../storageType';
import { auth } from '../../config/firebase';

export const checkPermission = (operation) => {
  const storageType = getStorageType();

  if (storageType === 'localStorage') {
    return true;
  }

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

export const localStorageUtils = {
  setItem: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('로컬스토리지 저장 실패:', error);
      return false;
    }
  },

  getItem: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('로컬스토리지 조회 실패:', error);
      return null;
    }
  },

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

export const STORAGE_KEYS = {
  FOCUS_CYCLES: 'focus_cycles',
  DAILY_CHECKLISTS: 'daily_checklists',
  LINKS: 'linkItems',
  CONCEPTMAP: 'conceptmap-links',
  TODOS: 'todoItems'
};