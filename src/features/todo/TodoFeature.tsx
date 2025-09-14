import React from 'react';
import { useTodoLogic } from './hooks/useTodoLogic';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';

export const TodoFeature: React.FC = () => {
  const todoLogic = useTodoLogic();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">할 일 관리</h1>
        <p className="text-gray-600">개인 할 일 목록을 체계적으로 관리하세요</p>
      </div>

      <TodoInput onAddTodo={todoLogic.addTodo} />

      <TodoList
        todos={todoLogic.todos}
        onToggleTodo={todoLogic.toggleTodo}
        onDeleteTodo={todoLogic.deleteTodo}
        onUpdateTodo={todoLogic.updateTodo}
      />
    </div>
  );
};
