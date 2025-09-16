import React from 'react';
import { ChevronDown, ChevronRight, Copy, Eye, EyeOff, Code2 } from 'lucide-react';
import { checklistTemplate } from '../../../constants/checklistTemplate';
import { copySectionContent } from '../../../utils/clipboardUtils';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';
import { MarkdownHelp } from '../../../components/MarkdownHelp';
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
    previewState,
    editMode,
    toggleSection,
    updateAnswer,
    updateAnswerWithFormatting,
    togglePreview
  } = checklistLogic;

  return (
    <div className="space-y-4">
      {Object.entries(checklistTemplate).map(([sectionKey, section]) => (
        <div key={sectionKey} className="border rounded-lg overflow-hidden border-gray-200">
          {/* Section header */}
          <div className="p-4 transition-colors flex items-center justify-between bg-gray-100 hover:bg-gray-200">
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
            <div className={`p-6 border-t ${sectionKey === 'reflection'
              ? 'bg-white border-purple-200'
              : 'bg-white border-gray-100'
              }`}>
              <div className="space-y-6">
                {section.questions.map((question, index) => {
                  const previewKey = `${sectionKey}_${index}`;
                  const isPreviewMode = previewState[previewKey];
                  const currentValue = checklistData[selectedDate]?.data?.[sectionKey]?.[index] || '';

                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className={`block text-lg font-semibold leading-relaxed ${sectionKey === 'reflection'
                          ? 'text-purple-700'
                          : 'text-gray-800'
                          }`}>
                          {question}
                        </label>
                        {editMode && (
                          <div className="flex items-center gap-2">
                            <MarkdownHelp />
                            {currentValue.trim() && (
                              <>
                                <button
                                  onClick={() => {
                                    console.log('Formatting button clicked');
                                    updateAnswerWithFormatting(selectedDate, sectionKey, index, currentValue);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300"
                                  title="코드 포맷팅 적용"
                                >
                                  <Code2 size={14} />
                                  포맷팅
                                </button>
                                <button
                                  onClick={() => togglePreview(sectionKey, index)}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isPreviewMode
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  title={isPreviewMode ? '편집 모드로 전환' : '미리보기 모드로 전환'}
                                >
                                  {isPreviewMode ? (
                                    <>
                                      <EyeOff size={14} />
                                      편집
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={14} />
                                      미리보기
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {editMode ? (
                        isPreviewMode ? (
                          <div className={`w-full p-3 border rounded-lg ${sectionKey === 'reflection'
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-300 bg-gray-50'
                            }`}>
                            <div className={`text-base leading-relaxed ${sectionKey === 'reflection'
                              ? 'text-purple-800'
                              : 'text-gray-800'
                              }`}>
                              <MarkdownRenderer content={currentValue} />
                            </div>
                          </div>
                        ) : (
                          <textarea
                            value={currentValue}
                            onChange={(e) => updateAnswer(selectedDate, sectionKey, index, e.target.value)}
                            onBlur={(e) => {
                              // 포커스를 잃을 때 자동으로 포맷팅 적용
                              if (e.target.value.trim() && e.target.value !== currentValue) {
                                console.log('Auto-formatting on blur');
                                updateAnswerWithFormatting(selectedDate, sectionKey, index, e.target.value);
                              }
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-vertical max-h-[500px] border-gray-300 focus:ring-blue-500"
                            placeholder="답변을 입력해주세요... (마크다운 문법 지원: **굵게**, *기울임*, - 목록, 1. 번호목록, ```코드블럭``` 등)"
                          />
                        )
                      ) : (
                        <div className="leading-relaxed text-gray-700">
                          {checklistData[selectedDate]?.data?.[sectionKey]?.[index] ? (
                            <div className="text-base leading-relaxed text-gray-800">
                              <MarkdownRenderer content={checklistData[selectedDate].data[sectionKey][index]} />
                            </div>
                          ) : (
                            <p className="italic text-sm text-gray-400">
                              답변이 없습니다. 수정 버튼을 눌러 작성해주세요.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
