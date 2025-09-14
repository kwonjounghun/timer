import { useState, useEffect, useCallback } from 'react';

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

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todoItems');
    if (saved) {
      try {
        const parsedTodos = JSON.parse(saved).map((todo: any) => ({
          ...todo,
          // 기존 데이터와의 호환성을 위한 마이그레이션
          title: todo.title || todo.text || '제목 없음',
          content: todo.content || '',
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
        }));
        setTodos(parsedTodos);
      } catch (error) {
        console.error('Failed to parse todo items:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('todoItems', JSON.stringify(todos));
    }
  }, [todos]);

  // Add new todo
  const addTodo = useCallback((title: string, content: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
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
  }, []);

  // Toggle todo completion
  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date() : undefined
        }
        : todo
    ));
  }, []);

  // Delete todo
  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  // Update todo
  const updateTodo = useCallback((id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  }, []);

  // Clear completed todos
  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);

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
