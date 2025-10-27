import React, { useState } from 'react';
import { Plus, AlertCircle, Eye, Edit3 } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';

interface TodoInputProps {
  onAddTodo: (title: string, content: string, priority: 'high' | 'medium' | 'low') => void;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(title, content, priority);
      setTitle('');
      setContent('');
      setPriority('medium');
    }
  };

  const getPriorityColor = (p: 'high' | 'medium' | 'low') => {
    switch (p) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="space-y-4">
        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일의 제목을 입력하세요..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
          <div className="text-xs text-gray-400 mt-1">
            {title.length}/100
          </div>
        </div>

        {/* 내용 입력 */}
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
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px]">
              {content.trim() ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-gray-500 italic">미리보기를 보려면 내용을 입력하세요...</p>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="할 일의 상세 내용을 입력하세요... (마크다운 형식 지원)&#10;&#10;예시:&#10;- [ ] 체크리스트 항목 1&#10;- [ ] 체크리스트 항목 2&#10;&#10;`코드 블록` 또는 *기울임*"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              maxLength={1000}
            />
          )}

          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-500">
              마크다운 형식 지원: **굵게**, *기울임*, `코드`, - 리스트, # 제목
            </div>
            <div className="text-xs text-gray-400">
              {content.length}/1000
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">우선순위:</label>
          <div className="flex gap-2">
            {(['high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`
                  px-3 py-1 rounded-lg text-sm font-medium border transition-colors
                  ${priority === p
                    ? getPriorityColor(p)
                    : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                {p === 'high' && <><AlertCircle size={14} className="inline mr-1" />높음</>}
                {p === 'medium' && '보통'}
                {p === 'low' && '낮음'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          할 일 추가
        </button>
      </div>
    </form>
  );
};
