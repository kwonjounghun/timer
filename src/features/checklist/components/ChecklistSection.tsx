import React from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { checklistTemplate } from '../../../constants/checklistTemplate';
import { copySectionContent } from '../../../utils/clipboardUtils';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';
import { ChecklistLogic } from '../hooks/useChecklistLogic';

interface ChecklistSectionProps {
  checklistLogic: ChecklistLogic;
  selectedDate: string;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  checklistLogic,
  selectedDate
}) => {
  const {
    checklistData,
    expandedSections,
    editMode,
    toggleSection,
    updateAnswer
  } = checklistLogic;

  return (
    <div className="space-y-4">
      {Object.entries(checklistTemplate).map(([sectionKey, section]) => (
        <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Section header */}
          <div className="p-4 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-between">
            <button
              onClick={() => toggleSection(sectionKey)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
              {expandedSections[sectionKey as keyof typeof expandedSections] ?
                <ChevronDown className="text-gray-600" size={20} /> :
                <ChevronRight className="text-gray-600" size={20} />
              }
            </button>
            {!editMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copySectionContent(sectionKey, checklistData[selectedDate]?.data?.[sectionKey], checklistTemplate);
                }}
                className="ml-3 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={`${section.title} 내용 복사`}
              >
                <Copy size={16} />
              </button>
            )}
          </div>

          {/* Section content */}
          {expandedSections[sectionKey as keyof typeof expandedSections] && (
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="space-y-6">
                {section.questions.map((question, index) => (
                  <div key={index} className="space-y-3">
                    <label className="block text-lg font-semibold text-gray-800 leading-relaxed">
                      {question}
                    </label>
                    {editMode ? (
                      <textarea
                        value={checklistData[selectedDate]?.data?.[sectionKey]?.[index] || ''}
                        onChange={(e) => updateAnswer(selectedDate, sectionKey, index, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical max-h-[500px]"
                        placeholder="답변을 입력해주세요... (마크다운 문법 지원: **굵게**, *기울임*, - 목록, 1. 번호목록 등)"
                      />
                    ) : (
                      <div className="text-gray-700 leading-relaxed">
                        {checklistData[selectedDate]?.data?.[sectionKey]?.[index] ? (
                          <div className="text-gray-800 text-base leading-relaxed">
                            <MarkdownRenderer content={checklistData[selectedDate].data[sectionKey][index]} />
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
  );
};
