import { useState, useEffect, useCallback } from 'react';
import { hybridStorage } from '../../../utils/hybridStorage';

export interface TodoItem {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  completedAt?: Date;
  _isLoading?: boolean; // 임시 ID 상태 표시용
}

export interface TodoLogic {
  todos: TodoItem[];
  addTodo: (title: string, content: string, priority?: 'high' | 'medium' | 'low') => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>) => void;
  clearCompleted: () => void;
  getStats: () => { total: number; completed: number; pending: number };
}

export const useTodoLogic = (): TodoLogic => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // Load data from hybrid storage on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const todos = await hybridStorage.getTodos();
        const parsedTodos = todos.map((todo: any) => {
          const createdAt = new Date(todo.createdAt);
          const completedAt = todo.completedAt ? new Date(todo.completedAt) : undefined;

          return {
            ...todo,
            // 기존 데이터와의 호환성을 위한 마이그레이션
            title: todo.title || todo.text || '제목 없음',
            content: todo.content || '',
            createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            completedAt: completedAt && !isNaN(completedAt.getTime()) ? completedAt : undefined,
          };
        });
        setTodos(parsedTodos);
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    };

    loadTodos();
  }, []);

  // Remove the automatic save effect since we're using hybrid storage for individual operations

  // Add new todo
  const addTodo = useCallback(async (title: string, content: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!title.trim()) return;

    const newTodo: TodoItem = {
      id: '', // 빈 ID로 시작
      title: title.trim(),
      content: content.trim(),
      completed: false,
      priority,
      createdAt: new Date(),
    };

    // 로딩 상태 표시를 위한 임시 ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempTodo = { ...newTodo, id: tempId };

    // UI에 임시 할일 추가 (비활성화 상태로 표시)
    setTodos(prev => [{ ...tempTodo, _isLoading: true }, ...prev]);

    // Save using hybrid storage
    try {
      const actualId = await hybridStorage.saveTodo({
        ...newTodo,
        id: undefined // ID를 undefined로 설정하여 새로 생성되도록 함
      });

      if (actualId) {
        // 실제 ID로 교체하고 로딩 상태 제거
        setTodos(prev => prev.map(todo =>
          todo.id === tempId ? { ...todo, id: actualId, _isLoading: false } : todo
        ));
      } else {
        console.error('할일 저장 실패: ID를 받지 못함');
        setTodos(prev => prev.filter(todo => todo.id !== tempId));
        alert('할일 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('할일 저장 실패:', error);
      // 실패 시 추가된 할일 제거
      setTodos(prev => prev.filter(todo => todo.id !== tempId));
      // 사용자에게 알림
      alert('할일 저장에 실패했습니다. 다시 시도해주세요.');
    }
  }, []);

  // Toggle todo completion
  const toggleTodo = useCallback(async (id: string) => {
    // 임시 ID인지 확인
    if (id.startsWith('temp_')) {
      console.warn('임시 ID로 완료 상태를 업데이트하려고 시도중:', id);
      // 임시 ID인 경우 아무것도 하지 않음 (저장이 완료될 때까지 대기)
      return;
    }

    // 실제 ID인 경우에만 처리
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) {
      console.warn('업데이트할 할일을 찾을 수 없음:', id);
      return;
    }

    // 로딩 중인 할일은 처리하지 않음
    if (todoToUpdate._isLoading) {
      console.warn('로딩 중인 할일은 조작할 수 없습니다:', id);
      return;
    }

    const updatedTodo = {
      ...todoToUpdate,
      completed: !todoToUpdate.completed,
      completedAt: !todoToUpdate.completed ? new Date() : undefined
    };

    // UI 먼저 업데이트
    setTodos(prev => prev.map(todo =>
      todo.id === id ? updatedTodo : todo
    ));

    // 저장소에 저장
    try {
      await hybridStorage.updateTodo(id, {
        completed: updatedTodo.completed,
        completedAt: updatedTodo.completedAt,
      });
    } catch (error) {
      console.error('할일 업데이트 실패:', error);
      // 실패 시 상태 되돌리기
      setTodos(prev => prev.map(todo =>
        todo.id === id ? todoToUpdate : todo
      ));
      // 사용자에게 알림
      alert('할일 상태 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  }, [todos]);

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id);

    setTodos(prev => prev.filter(todo => todo.id !== id));

    // 임시 ID인 경우 저장소에서 삭제할 필요 없음
    if (id.startsWith('temp_')) {
      return;
    }

    // Save using hybrid storage
    try {
      await hybridStorage.deleteTodo(id);
    } catch (error) {
      console.error('할일 삭제 실패:', error);
      // 실패 시 원래 데이터 복원
      if (todoToDelete) {
        setTodos(prev => [todoToDelete, ...prev]);
      }
    }
  }, [todos]);

  // Update todo
  const updateTodo = useCallback(async (id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>) => {
    // 임시 ID인지 확인
    if (id.startsWith('temp_')) {
      console.warn('임시 ID로 업데이트하려고 시도중:', id);
      // 임시 ID인 경우 아무것도 하지 않음 (저장이 완료될 때까지 대기)
      return;
    }

    // 실제 ID인 경우에만 처리
    const originalTodo = todos.find(todo => todo.id === id);
    if (!originalTodo) {
      console.warn('업데이트할 할일을 찾을 수 없음:', id);
      return;
    }

    // 로딩 중인 할일은 처리하지 않음
    if (originalTodo._isLoading) {
      console.warn('로딩 중인 할일은 조작할 수 없습니다:', id);
      return;
    }

    const updatedTodo = { ...originalTodo, ...updates };

    // UI 먼저 업데이트
    setTodos(prev => prev.map(todo =>
      todo.id === id ? updatedTodo : todo
    ));

    // 저장소에 저장
    try {
      await hybridStorage.updateTodo(id, updates);
    } catch (error) {
      console.error('할일 업데이트 실패:', error);
      // 실패 시 원래 상태로 되돌리기
      setTodos(prev => prev.map(todo =>
        todo.id === id ? originalTodo : todo
      ));
      // 사용자에게 알림
      alert('할일 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  }, [todos]);

  // Clear completed todos
  const clearCompleted = useCallback(async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    setTodos(prev => prev.filter(todo => !todo.completed));

    // Delete completed todos from hybrid storage
    for (const todo of completedTodos) {
      try {
        await hybridStorage.deleteTodo(todo.id);
      } catch (error) {
        console.error('완료된 할일 삭제 실패:', error);
      }
    }
  }, [todos]);

  // Get statistics
  const getStats = useCallback(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [todos]);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    clearCompleted,
    getStats,
  };
};
