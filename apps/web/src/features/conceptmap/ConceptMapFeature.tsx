import React, { useState } from 'react';
import { Plus, Network } from 'lucide-react';
import { useConceptMapLogic } from './hooks/useConceptMapLogic';
import { ConceptMapInput } from './components/ConceptMapInput';
import { ConceptMapList } from './components/ConceptMapList';

export const ConceptMapFeature: React.FC = () => {
  const {
    conceptMaps,
    addConceptMap,
    updateConceptMap,
    deleteConceptMap,
    searchQuery,
    setSearchQuery,
    filteredConceptMaps
  } = useConceptMapLogic();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddConceptMap = (title: string, url: string) => {
    addConceptMap(title, url);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1"></div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Network className="text-blue-500" size={32} />
              컨셉맵 링크 관리
            </h1>
            <div className="flex-1 flex justify-end">
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <Plus size={20} />
                  새 컨셉맵 추가
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-center">컨셉맵 링크를 체계적으로 관리하세요</p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 추가 폼 */}
          {showAddForm && (
            <ConceptMapInput
              onAddConceptMap={handleAddConceptMap}
            />
          )}

          {/* 컨셉맵 리스트 */}
          <ConceptMapList
            conceptMaps={filteredConceptMaps}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onUpdateConceptMap={updateConceptMap}
            onDeleteConceptMap={deleteConceptMap}
          />

          {/* 통계 */}
          {conceptMaps.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  총 {conceptMaps.length}개의 컨셉맵 링크
                </div>
                {searchQuery && (
                  <div className="text-sm text-blue-600">
                    {filteredConceptMaps.length}개 검색됨
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
