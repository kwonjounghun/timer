import React, { useState } from 'react';
import { useTodoLogic } from './hooks/useTodoLogic';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { Plus, RefreshCw } from 'lucide-react';

export const TodoFeature: React.FC = () => {
  const todoLogic = useTodoLogic();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTodo = (title: string, content: string, priority: 'high' | 'medium' | 'low') => {
    todoLogic.addTodo(title, content, priority);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1"></div>
          <h1 className="text-3xl font-bold text-gray-800">할 일 관리</h1>
          <div className="flex-1 flex justify-end gap-3">
            {/* 새로고침 버튼 */}
            <button
              onClick={todoLogic.refreshTodos}
              className="flex items-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors shadow-lg"
              title="할일 목록 새로고침"
            >
              <RefreshCw size={20} />
              새로고침
            </button>
            
            {/* 할 일 추가 버튼 */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
              >
                <Plus size={20} />
                새 할 일 추가
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-center">개인 할 일 목록을 체계적으로 관리하세요</p>
      </div>

      {/* 할 일 추가 폼 */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="text-blue-500" size={20} />
              새 할 일 추가
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="취소"
            >
              ✕
            </button>
          </div>
          <TodoInput onAddTodo={handleAddTodo} />
        </div>
      )}

      <TodoList
        todos={todoLogic.todos}
        onToggleTodo={todoLogic.toggleTodo}
        onDeleteTodo={todoLogic.deleteTodo}
        onUpdateTodo={todoLogic.updateTodo}
      />
    </div>
  );
};
