import { getStorageType } from '../storageType';
import { checkPermission, localStorageUtils, STORAGE_KEYS } from './storageUtils';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument, getDocuments } from './firebaseUtils';

const localStorageApi = {
  saveTodo: async (todoData) => {
    const todos = localStorageUtils.getItem(STORAGE_KEYS.TODOS) || [];
    const newTodo = {
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

const firebaseApi = {
  saveTodo: async (todoData) => {
    return await createDocument(COLLECTIONS.TODOS, todoData);
  },

  getTodos: async () => {
    return await getDocuments(COLLECTIONS.TODOS, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  },

  updateTodo: async (todoId, updateData) => {
    await updateDocument(COLLECTIONS.TODOS, todoId, updateData);
    return true;
  },

  deleteTodo: async (todoId) => {
    await deleteDocument(COLLECTIONS.TODOS, todoId);
    return true;
  }
};

export const todoStorage = {
  saveTodo: async (todoData) => {
    if (!checkPermission('할일 저장')) {
      throw new Error('뷰어 모드에서는 편집할 수 없습니다. 로그인하면 편집 가능합니다.');
    }

    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.saveTodo(todoData);
    } else {
      return await localStorageApi.saveTodo(todoData);
    }
  },

  getTodos: async () => {
    const storageType = getStorageType();
    if (storageType === 'firebase') {
      return await firebaseApi.getTodos();
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
      return await firebaseApi.updateTodo(todoId, updateData);
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
      return await firebaseApi.deleteTodo(todoId);
    } else {
      return await localStorageApi.deleteTodo(todoId);
    }
  }
};