import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Check, X, Search } from 'lucide-react';
import { ConceptMapItem } from '../hooks/useConceptMapLogic';

interface ConceptMapListProps {
  conceptMaps: ConceptMapItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateConceptMap: (id: string, updates: Partial<Omit<ConceptMapItem, 'id' | 'createdAt'>>) => void;
  onDeleteConceptMap: (id: string) => void;
}

export const ConceptMapList: React.FC<ConceptMapListProps> = ({
  conceptMaps,
  searchQuery,
  onSearchChange,
  onUpdateConceptMap,
  onDeleteConceptMap
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const startEdit = (conceptMap: ConceptMapItem) => {
    setEditingId(conceptMap.id);
    setEditTitle(conceptMap.title);
    setEditUrl(conceptMap.url);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim() && editUrl.trim()) {
      onUpdateConceptMap(editingId, {
        title: editTitle.trim(),
        url: editUrl.trim()
      });
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditUrl('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말로 이 컨셉맵 링크를 삭제하시겠습니까?')) {
      onDeleteConceptMap(id);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="컨셉맵 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 컨셉맵 리스트 */}
      {conceptMaps.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? '검색 결과가 없습니다.' : '컨셉맵 링크가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-3">
          {conceptMaps.map((conceptMap) => (
            <div key={conceptMap.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              {editingId === conceptMap.id ? (
                // 편집 모드
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">링크</label>
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      <Check size={14} />
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      <X size={14} />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {conceptMap.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conceptMap.url}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {conceptMap.createdAt.toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openLink(conceptMap.url)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="링크 열기"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <button
                      onClick={() => startEdit(conceptMap)}
                      className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(conceptMap.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
