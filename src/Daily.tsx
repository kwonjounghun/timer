import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, Edit, X, Check } from 'lucide-react';

const DailyCheckManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSections, setExpandedSections] = useState({
    morning: false,
    lunch: false,
    evening: false
  });
  const [checkData, setCheckData] = useState({});
  const [editMode, setEditMode] = useState(false);

  // 체크리스트 템플릿
  const checklistTemplate = {
    morning: {
      title: '🌅 아침 점검',
      questions: [
        '오늘 하나만큼은 꼭 해내고 싶은 건요?',
        '그게 잘됐다는 건 뭘 보고 알 수 있을까요?',
        '언제, 어떻게 하시겠어요?',
        '혹시 걱정되는 게 있나요?',
        '그걸 위해 뭘 대비/예방하면 좋을까요?'
      ]
    },
    lunch: {
      title: '🏙️ 점심 점검',
      questions: [
        '아침에 계획했던 것은 어떻게 되고 있나요?',
        '내가 바라던 결과와 어떤 차이가 있나요?',
        '지금까지 과정에서 무엇을 배웠나요?',
        '앞으로 어떻게 하시겠어요?',
        '혹시 걱정되는 게 있나요?',
        '그걸 위해 뭘 대비/예방하면 좋을까요?'
      ]
    },
    evening: {
      title: '🌆 저녁 점검',
      questions: [
        '오늘 목표했던 것은 어떻게 되었나요?',
        '내가 바라던 결과와 어떤 차이가 있나요?',
        '어떤 패턴을 발견했나요? 어떻게 도식화 해볼 수 있을까요?',
        '내일까지 이거 하나만큼은 하면 참 좋겠다 하는 건요?',
        '그걸 위해 어떤 준비를 해둘까요?'
      ]
    }
  };

  // 데이터 로드 (초기 상태만 설정)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!checkData[today]) {
      setCheckData(prev => ({
        ...prev,
        [today]: {}
      }));
    }
  }, []);

  // 섹션 토글
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 답변 업데이트
  const updateAnswer = (section, questionIndex, value) => {
    const newData = {
      ...checkData,
      [selectedDate]: {
        ...checkData[selectedDate],
        [section]: {
          ...checkData[selectedDate]?.[section],
          [questionIndex]: value
        }
      }
    };
    setCheckData(newData);
  };

  // 편집 모드 토글
  const toggleEditMode = () => {
    setEditMode(true);
  };

  // 편집 완료
  const completeEdit = () => {
    setEditMode(false);
    alert('편집이 완료되었습니다!');
  };

  // 편집 취소
  const cancelEdit = () => {
    setEditMode(false);
  };

  // 저장된 날짜 목록 (현재 날짜도 포함)
  const allDates = [...new Set([...Object.keys(checkData), selectedDate])].sort().reverse();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">일일 점검 시스템</h1>
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
        </div>

        {/* 날짜 선택 */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="text-gray-600" size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 날짜 목록 */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">날짜 목록:</p>
            <div className="flex flex-wrap gap-2">
              {allDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    date === selectedDate 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {date}
                  {checkData[date] && Object.keys(checkData[date]).length > 0 && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 체크리스트 섹션들 */}
        <div className="space-y-4">
          {Object.entries(checklistTemplate).map(([sectionKey, section]) => (
            <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 섹션 헤더 */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full p-4 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-between text-left"
              >
                <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
                {expandedSections[sectionKey] ? 
                  <ChevronDown className="text-gray-600" size={20} /> : 
                  <ChevronRight className="text-gray-600" size={20} />
                }
              </button>

              {/* 섹션 내용 */}
              {expandedSections[sectionKey] && (
                <div className="p-6 bg-white border-t border-gray-100">
                  <div className="space-y-6">
                    {section.questions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {question}
                        </label>
                        {editMode ? (
                          <textarea
                            value={checkData[selectedDate]?.[sectionKey]?.[index] || ''}
                            onChange={(e) => updateAnswer(sectionKey, index, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                            placeholder="답변을 입력해주세요..."
                          />
                        ) : (
                          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {checkData[selectedDate]?.[sectionKey]?.[index] ? (
                              <p className="text-gray-800">{checkData[selectedDate][sectionKey][index]}</p>
                            ) : (
                              <p className="text-gray-400 italic">답변이 없습니다. 수정 버튼을 눌러 작성해주세요.</p>
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

        {/* 푸터 정보 */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-600">⚠️</span>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">사용법 및 데이터 저장 안내</p>
              <p>💡 수정 버튼을 눌러 편집 모드로 전환한 후 답변을 작성하세요.</p>
              <p>⚠️ 현재 환경에서는 데이터가 메모리에만 저장됩니다. 페이지를 새로고침하거나 닫으면 데이터가 사라집니다.</p>
              <p className="mt-1">📝 중요한 내용은 별도로 복사해두시길 권장합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckManager;