import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Save, X, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { LinkItem } from '../hooks/useLinksLogic';

interface LinkListProps {
  links: LinkItem[];
  filteredLinks: LinkItem[];
  searchQuery: string;
  selectedCategory: string;
  categories: string[];
  onUpdateLink: (id: string, updates: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) => void;
  onDeleteLink: (id: string) => void;
  onToggleReadStatus: (id: string) => void;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

export const LinkList: React.FC<LinkListProps> = ({
  links,
  filteredLinks,
  searchQuery,
  selectedCategory,
  categories,
  onUpdateLink,
  onDeleteLink,
  onToggleReadStatus,
  onSearchChange,
  onCategoryChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryInput, setEditCategoryInput] = useState('');
  const [editCategories, setEditCategories] = useState<string[]>([]);

  const startEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditDescription(link.description);
    setEditCategories([...link.categories]);
    setEditCategoryInput('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditUrl('');
    setEditDescription('');
    setEditCategories([]);
    setEditCategoryInput('');
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim() && editUrl.trim()) {
      onUpdateLink(editingId, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        description: editDescription.trim(),
        categories: editCategories,
      });
      cancelEdit();
    }
  };

  const addEditCategory = () => {
    const trimmedCategory = editCategoryInput.trim();
    if (trimmedCategory && !editCategories.includes(trimmedCategory)) {
      setEditCategories(prev => [...prev, trimmedCategory]);
      setEditCategoryInput('');
    }
  };

  const removeEditCategory = (categoryToRemove: string) => {
    setEditCategories(prev => prev.filter(cat => cat !== categoryToRemove));
  };

  const handleEditCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEditCategory();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('정말로 이 링크를 삭제하시겠습니까?')) {
      onDeleteLink(id);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-gray-400 mb-4">
          <ExternalLink size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">아직 저장된 링크가 없습니다</h3>
        <p className="text-gray-600">첫 번째 문서 링크를 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="제목, 설명, 카테고리로 검색..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="sm:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 결과 개수 */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredLinks.length}개의 링크 (전체 {links.length}개)
        </div>
      </div>

      {/* 링크 목록 */}
      <div className="space-y-4">
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${link.isRead
              ? 'border-green-500 bg-green-50'
              : 'border-blue-500'
              }`}
          >
            {editingId === link.id ? (
              // 편집 모드
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editCategoryInput}
                        onChange={(e) => setEditCategoryInput(e.target.value)}
                        onKeyPress={handleEditCategoryKeyPress}
                        placeholder="카테고리 입력 후 Enter 또는 , 키를 누르세요"
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addEditCategory}
                        className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      >
                        추가
                      </button>
                    </div>

                    {/* 편집 중인 카테고리 태그들 */}
                    {editCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editCategories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {category}
                            <button
                              type="button"
                              onClick={() => removeEditCategory(category)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
                  >
                    <Save size={16} />
                  </button>
                </div>
              </div>
            ) : (
              // 읽기 모드
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${link.isRead
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {link.isRead ? '읽음' : '읽지 않음'}
                      </span>
                      {link.categories.map((category, index) => (
                        <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {category}
                        </span>
                      ))}
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${link.isRead ? 'text-gray-600' : 'text-gray-800'
                      }`}>
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className={`text-sm mb-3 ${link.isRead ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                        {link.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>생성: {new Date(link.createdAt).toLocaleDateString('ko-KR')}</span>
                      {link.readAt && (
                        <span>읽음: {new Date(link.readAt).toLocaleDateString('ko-KR')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => onToggleReadStatus(link.id)}
                      className={`p-2 rounded transition-colors ${link.isRead
                        ? 'text-green-600 hover:text-green-700 hover:bg-green-100'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100'
                        }`}
                      title={link.isRead ? "읽지 않음으로 표시" : "읽음으로 표시"}
                    >
                      {link.isRead ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="링크 열기"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => startEdit(link)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="편집"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLinks.length === 0 && links.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600">다른 검색어나 카테고리를 시도해보세요.</p>
        </div>
      )}
    </div>
  );
};
