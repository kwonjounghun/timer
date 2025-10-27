import { getStorageType } from '../storageType';
import { checkPermission, localStorageUtils, STORAGE_KEYS } from './storageUtils';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument, getDocuments } from './firebaseUtils';

const localStorageApi = {
  saveLink: async (linkData) => {
    const links = localStorageUtils.getItem(STORAGE_KEYS.LINKS) || [];
    const newLink = {
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
  }
};

const firebaseApi = {
  saveLink: async (linkData) => {
    return await createDocument(COLLECTIONS.LINKS, linkData);
  },

  getLinks: async () => {
    return await getDocuments(COLLECTIONS.LINKS, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  },

  updateLink: async (linkId, updateData) => {
    await updateDocument(COLLECTIONS.LINKS, linkId, updateData);
    return true;
  },

  deleteLink: async (linkId) => {
    await deleteDocument(COLLECTIONS.LINKS, linkId);
    return true;
  }
};

export const linkStorage = {
  saveLink: async (linkData) => {
    if (!checkPermission('링크 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.saveLink(linkData);
    } else {
      return await localStorageApi.saveLink(linkData);
    }
  },

  getLinks: async () => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getLinks();
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
      return await firebaseApi.updateLink(linkId, updateData);
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
      return await firebaseApi.deleteLink(linkId);
    } else {
      return await localStorageApi.deleteLink(linkId);
    }
  }
};