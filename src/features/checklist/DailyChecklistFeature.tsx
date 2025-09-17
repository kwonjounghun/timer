import React from 'react';
import { Edit, X, Check } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useChecklistLogic } from './hooks/useChecklistLogic';
import { ChecklistSection } from './components/ChecklistSection';
import { EmptyState } from './components/EmptyState';

export const DailyChecklistFeature: React.FC = () => {
  const { selectedDate } = useAppContext();

  // 비즈니스 로직을 커스텀 훅으로 분리
  const checklistLogic = useChecklistLogic(selectedDate);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">일일 점검 시스템</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Storage type indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded text-xs font-medium ${checklistLogic.storageInfo.type === 'firebase'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
              }`}>
              {checklistLogic.storageInfo.type === 'firebase' ? '🔥 Firebase' : '💾 Local'}
            </span>
          </div>

          {(checklistLogic.hasData || checklistLogic.editMode) && (
            <div className="flex items-center gap-2">
              {!checklistLogic.editMode ? (
                <button
                  onClick={checklistLogic.toggleEditMode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit size={16} />
                  수정
                </button>
              ) : (
                <>
                  <button
                    onClick={checklistLogic.completeEdit}
                    disabled={checklistLogic.isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      checklistLogic.isSaving 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <Check size={16} />
                    {checklistLogic.isSaving ? '저장 중...' : '완료'}
                  </button>
                  <button
                    onClick={checklistLogic.cancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X size={16} />
                    취소
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {checklistLogic.saveError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-sm font-medium">저장 오류:</span>
            <span className="text-sm">{checklistLogic.saveError}</span>
          </div>
        </div>
      )}

      {/* Checklist sections or empty state */}
      {checklistLogic.hasData || checklistLogic.editMode ? (
        <ChecklistSection
          checklistLogic={checklistLogic}
          selectedDate={selectedDate}
        />
      ) : (
        <EmptyState
          selectedDate={selectedDate}
          onStartEdit={checklistLogic.toggleEditMode}
        />
      )}
    </div>
  );
};