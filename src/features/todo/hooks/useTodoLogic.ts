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
        const parsedTodos = todos.map((todo: any) => ({
          ...todo,
          // 기존 데이터와의 호환성을 위한 마이그레이션
          title: todo.title || todo.text || '제목 없음',
          content: todo.content || '',
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
        }));
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
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      completed: false,
      priority,
      createdAt: new Date(),
    };

    setTodos(prev => [...prev, newTodo]);

    // Save using hybrid storage
    try {
      await hybridStorage.saveTodo(newTodo);
    } catch (error) {
      console.error('할일 저장 실패:', error);
    }
  }, []);

  // Toggle todo completion
  const toggleTodo = useCallback(async (id: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        const updatedTodo = {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date() : undefined
        };

        // Save using hybrid storage
        hybridStorage.updateTodo(id, {
          completed: updatedTodo.completed,
          completedAt: updatedTodo.completedAt,
        }).catch(error => {
          console.error('할일 업데이트 실패:', error);
        });

        return updatedTodo;
      }
      return todo;
    }));
  }, []);

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));

    // Save using hybrid storage
    try {
      await hybridStorage.deleteTodo(id);
    } catch (error) {
      console.error('할일 삭제 실패:', error);
    }
  }, []);

  // Update todo
  const updateTodo = useCallback(async (id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    ));

    // Save using hybrid storage
    try {
      await hybridStorage.updateTodo(id, updates);
    } catch (error) {
      console.error('할일 업데이트 실패:', error);
    }
  }, []);

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
