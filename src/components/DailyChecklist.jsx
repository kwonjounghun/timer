import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Calendar, Edit, X, Check, Copy } from 'lucide-react';
import { useDailyChecklist } from '../adapters/react/useDailyChecklist';
import { checklistTemplate } from '../constants/checklistTemplate';
import { copySectionContent } from '../utils/clipboardUtils';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatDate } from '../utils/dateUtils';

export const DailyChecklist = ({ selectedDate, isExpanded, onToggle }) => {
  const {
    checkData,
    expandedSections,
    editMode,
    storageType,
    firebaseConnectionStatus,
    toggleSection,
    updateAnswer,
    toggleEditMode,
    completeEdit,
    cancelEdit,
    hasCheckDataForSelectedDate
  } = useDailyChecklist();

  const hasData = hasCheckDataForSelectedDate(selectedDate);

  if (!isExpanded) {
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={onToggle}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
          title="일일 점검 시스템 펼치기"
        >
          <Calendar size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 self-start">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="일일 점검 시스템 접기"
          >
            <ChevronRight size={16} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">일일 점검 시스템</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* 스토리지 타입 및 Firebase 연결 상태 표시 */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              storageType === 'firebase' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {storageType === 'firebase' ? '🔥 Firebase' : '💾 Local'}
            </span>
            {firebaseConnectionStatus && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                firebaseConnectionStatus.success 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {firebaseConnectionStatus.success ? '✅ 연결됨' : '❌ 연결 실패'}
              </span>
            )}
          </div>
          
          {(hasData || editMode) && (
            <div className="flex items-center gap-2">
              {!editMode ? (
                <button
                  onClick={toggleEditMode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit size={16} />
                  수정
                </button>
              ) : (
                <>
                  <button
                    onClick={completeEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check size={16} />
                    완료
                  </button>
                  <button
                    onClick={cancelEdit}
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

      {/* 체크리스트 섹션들 또는 빈 상태 메시지 */}
      {hasData || editMode ? (
        <div className="space-y-4">
          {Object.entries(checklistTemplate).map(([sectionKey, section]) => (
            <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 섹션 헤더 */}
              <div className="p-4 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-between">
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
                  {expandedSections[sectionKey] ? 
                    <ChevronDown className="text-gray-600" size={20} /> : 
                    <ChevronRight className="text-gray-600" size={20} />
                  }
                </button>
                {!editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copySectionContent(sectionKey, checkData[selectedDate]?.[sectionKey], checklistTemplate);
                    }}
                    className="ml-3 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={`${section.title} 내용 복사`}
                  >
                    <Copy size={16} />
                  </button>
                )}
              </div>

              {/* 섹션 내용 */}
              {expandedSections[sectionKey] && (
                <div className="p-6 bg-white border-t border-gray-100">
                  <div className="space-y-6">
                    {section.questions.map((question, index) => (
                      <div key={index} className="space-y-3">
                        <label className="block text-lg font-semibold text-gray-800 leading-relaxed">
                          {question}
                        </label>
                        {editMode ? (
                          <textarea
                            value={checkData[selectedDate]?.[sectionKey]?.[index] || ''}
                            onChange={(e) => updateAnswer(selectedDate, sectionKey, index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical max-h-[500px]"
                            placeholder="답변을 입력해주세요... (마크다운 문법 지원: **굵게**, *기울임*, - 목록, 1. 번호목록 등)"
                          />
                        ) : (
                          <div className="text-gray-700 leading-relaxed">
                            {checkData[selectedDate]?.[sectionKey]?.[index] ? (
                              <div className="text-gray-800 text-base leading-relaxed">
                                <MarkdownRenderer content={checkData[selectedDate][sectionKey][index]} />
                              </div>
                            ) : (
                              <p className="text-gray-400 italic text-sm">답변이 없습니다. 수정 버튼을 눌러 작성해주세요.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* 빈 상태 메시지 */
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Calendar className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              아직 작성된 계획이 없어요
            </h3>
            <p className="text-gray-500 mb-6">
              {formatDate(selectedDate)}에 대한 일일 점검을 시작해보세요!<br />
              아침, 점심, 저녁으로 나누어 하루를 계획하고 회고할 수 있어요.
            </p>
          </div>
          <button
            onClick={toggleEditMode}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Edit className="inline mr-2" size={18} />
            생성하기
          </button>
          <div className="mt-4 text-sm text-gray-400">
            💡 하루를 더 의미있게 보내기 위한 질문들로 구성되어 있어요<br />
            ✨ 답변 작성 시 마크다운 문법을 사용할 수 있습니다 (**굵게**, *기울임*, - 목록 등)
          </div>
        </div>
      )}
    </div>
  );
};
