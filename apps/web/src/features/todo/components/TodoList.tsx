import React, { useState } from 'react';
import { Check, X, Edit2, Trash2, Save, AlertCircle, Eye, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { TodoItem } from '../hooks/useTodoLogic';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';

interface TodoListProps {
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo: (id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodo,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditContent(todo.content);
    setEditPriority(todo.priority);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditPriority('medium');
    setIsPreviewMode(false);
  };

  const toggleExpanded = (todoId: string) => {
    setExpandedTodos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onUpdateTodo(editingId, {
        title: editTitle.trim(),
        content: editContent.trim(),
        priority: editPriority,
      });
      cancelEdit();
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    if (priority === 'high') {
      return <AlertCircle size={14} className="text-red-500" />;
    }
    return null;
  };

  // Sort todos: high priority first, then by creation date
  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    // 유효하지 않은 날짜가 있으면 뒤로 정렬
    if (isNaN(aTime) && isNaN(bTime)) return 0;
    if (isNaN(aTime)) return 1;
    if (isNaN(bTime)) return -1;
    return aTime - bTime;
  });

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Check size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">할 일이 없습니다</h3>
        <p className="text-gray-500">새로운 할 일을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        할 일 목록 ({todos.length}개)
      </h3>

      <div className="space-y-3">
        {sortedTodos.map((todo) => (
          <div
            key={todo.id}
            className={`
              border rounded-lg p-4 transition-all duration-200
              ${todo._isLoading
                ? 'bg-blue-50 border-blue-200 opacity-75'
                : todo.completed
                  ? 'bg-gray-50 border-gray-200 opacity-75'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {editingId === todo.id ? (
              // 편집 모드
              <div className="space-y-3">
                {/* 제목 편집 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    placeholder="제목을 입력하세요..."
                    maxLength={100}
                  />
                </div>

                {/* 내용 편집 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">내용 (마크다운 지원)</label>
                    <button
                      type="button"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      {isPreviewMode ? (
                        <>
                          <Edit3 size={12} />
                          편집
                        </>
                      ) : (
                        <>
                          <Eye size={12} />
                          미리보기
                        </>
                      )}
                    </button>
                  </div>

                  {isPreviewMode ? (
                    <div className="w-full p-3 border border-gray-300 rounded bg-gray-50 min-h-[80px]">
                      {editContent.trim() ? (
                        <MarkdownRenderer content={editContent} />
                      ) : (
                        <p className="text-gray-500 italic">미리보기를 보려면 내용을 입력하세요...</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="마크다운 형식으로 입력하세요..."
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">우선순위:</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
                  >
                    <Save size={16} />
                  </button>
                </div>
              </div>
            ) : (
              // 읽기 모드
              <div>
                {/* 제목 영역 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleTodo(todo.id)}
                    disabled={todo._isLoading}
                    className={`
                      flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${todo._isLoading
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        : todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }
                    `}
                    title={todo._isLoading ? '저장 중...' : todo.completed ? '완료 취소' : '완료 처리'}
                  >
                    {todo._isLoading ? (
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : todo.completed ? (
                      <Check size={14} />
                    ) : null}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {todo._isLoading && (
                        <span className="text-xs text-blue-600 font-medium">
                          저장 중...
                        </span>
                      )}
                      {!todo._isLoading && todo.completed && (
                        <span className="text-xs text-gray-500">
                          완료: {(() => {
                            const date = new Date(todo.completedAt!);
                            return isNaN(date.getTime()) ? '날짜 오류' : date.toLocaleDateString('ko-KR');
                          })()}
                        </span>
                      )}
                    </div>

                    {/* 제목 영역 */}
                    <div className="flex items-center gap-2">
                      {/* 우선순위 뱃지 */}
                      <span className={`
                        inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                        ${todo.priority === 'high'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : todo.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }
                      `}>
                        {todo.priority === 'high' && '🔥 높음'}
                        {todo.priority === 'medium' && '⚡ 보통'}
                        {todo.priority === 'low' && '📝 낮음'}
                      </span>

                      <h3 className={`
                        text-lg font-semibold text-gray-800 flex-1
                        ${todo.completed ? 'line-through text-gray-500' : ''}
                      `}>
                        {todo.title}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      생성: {(() => {
                        const date = new Date(todo.createdAt);
                        return isNaN(date.getTime()) ? '날짜 오류' : date.toLocaleDateString('ko-KR');
                      })()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* 펼치기/접기 버튼 */}
                    {todo.content && (
                      <button
                        onClick={() => toggleExpanded(todo.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title={expandedTodos.has(todo.id) ? "접기" : "펼치기"}
                      >
                        {expandedTodos.has(todo.id) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => startEdit(todo)}
                      disabled={todo._isLoading}
                      className={`
                        p-2 rounded transition-colors
                        ${todo._isLoading
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                        }
                      `}
                      title={todo._isLoading ? '저장 중...' : '편집'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      disabled={todo._isLoading}
                      className={`
                        p-2 rounded transition-colors
                        ${todo._isLoading
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }
                      `}
                      title={todo._isLoading ? '저장 중...' : '삭제'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 펼쳐진 내용 영역 */}
                {expandedTodos.has(todo.id) && todo.content && (
                  <div className="mt-3 ml-9 pl-4 border-l-2 border-gray-200">
                    <div className={`
                      text-gray-700
                      ${todo.completed ? 'line-through text-gray-500' : ''}
                    `}>
                      <MarkdownRenderer content={todo.content} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
