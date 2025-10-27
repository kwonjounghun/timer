import React, { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useLinksLogic } from './hooks/useLinksLogic';
import { LinkInput } from './components/LinkInput';
import { LinkList } from './components/LinkList';

export const LinksFeature: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    links,
    filteredLinks,
    searchQuery,
    selectedCategory,
    categories,
    addLink,
    updateLink,
    deleteLink,
    toggleReadStatus,
    setSearchQuery,
    setSelectedCategory,
    getStats,
  } = useLinksLogic();

  const stats = getStats();

  const handleAddLink = (title: string, url: string, description: string, categories: string[]) => {
    addLink(title, url, description, categories);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1"></div>
          <h1 className="text-3xl font-bold text-gray-800">문서 링크 관리</h1>
          <div className="flex-1 flex justify-end">
            {/* 링크 추가 버튼 */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
              >
                <Plus size={20} />
                새 링크 추가
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-center">읽을 문서 링크를 체계적으로 관리하세요</p>
      </div>

      {/* 링크 추가 폼 */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="text-blue-500" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">새 링크 추가</h2>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <LinkInput onAddLink={handleAddLink} />
        </div>
      )}

      {/* 링크 목록 */}
      <LinkList
        links={links}
        filteredLinks={filteredLinks}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        categories={categories}
        onUpdateLink={updateLink}
        onDeleteLink={deleteLink}
        onToggleReadStatus={toggleReadStatus}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
      />
    </div>
  );
};
