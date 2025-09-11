import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Target, AlertCircle, BookOpen, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar, Edit, X, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD 형식
  const [cyclesByDate, setCyclesByDate] = useState({}); // 날짜별로 사이클 저장
  const [expandedCycles, setExpandedCycles] = useState(new Set());
  const [reflection, setReflection] = useState({
    result: '',
    distractions: '',
    thoughts: ''
  });
  const [editingCycle, setEditingCycle] = useState(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Daily 체크리스트 관련 상태
  const [expandedSections, setExpandedSections] = useState({
    morning: false,
    lunch: false,
    evening: false
  });
  const [checkData, setCheckData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isDailySystemExpanded, setIsDailySystemExpanded] = useState(true);

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

  // 로컬스토리지에서 데이터 불러오기
  useEffect(() => {
    // 타이머 데이터 불러오기
    const savedCycles = localStorage.getItem('focusTimerCycles');
    if (savedCycles) {
      try {
        const parsedCycles = JSON.parse(savedCycles);
        // Date 객체로 변환
        const convertedCycles = {};
        Object.keys(parsedCycles).forEach(date => {
          convertedCycles[date] = parsedCycles[date].map(cycle => ({
            ...cycle,
            startTime: new Date(cycle.startTime),
            endTime: new Date(cycle.endTime)
          }));
        });
        setCyclesByDate(convertedCycles);
      } catch (error) {
        console.error('로컬스토리지 데이터 파싱 오류:', error);
        localStorage.removeItem('focusTimerCycles');
      }
    }

    // 체크리스트 데이터 불러오기
    const savedCheckData = localStorage.getItem('dailyCheckData');
    if (savedCheckData) {
      try {
        setCheckData(JSON.parse(savedCheckData));
      } catch (error) {
        console.error('체크리스트 데이터 파싱 오류:', error);
        localStorage.removeItem('dailyCheckData');
      }
    }
  }, []);

  // cyclesByDate가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (Object.keys(cyclesByDate).length > 0) {
      localStorage.setItem('focusTimerCycles', JSON.stringify(cyclesByDate));
    }
  }, [cyclesByDate]);

  // checkData가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (Object.keys(checkData).length > 0) {
      localStorage.setItem('dailyCheckData', JSON.stringify(checkData));
    }
  }, [checkData]);

  // Create notification sound
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const createBeep = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    audioRef.current = createBeep;
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowReflection(true);
      if (audioRef.current) {
        audioRef.current();
      }
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (currentTask.trim()) {
      setShowTaskInput(false);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };


  const saveReflection = () => {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (10 * 60 - timeLeft) * 1000);
    
    const newCycle = {
      id: Date.now(),
      task: currentTask,
      startTime: startTime,
      endTime: endTime,
      timeSpent: 10 * 60 - timeLeft,
      result: reflection.result,
      distractions: reflection.distractions,
      thoughts: reflection.thoughts
    };
    
    // 선택된 날짜에 사이클 추가
    setCyclesByDate(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newCycle]
    }));
    
    setShowReflection(false);
    setReflection({ result: '', distractions: '', thoughts: '' });
    
    // 초기 상태로 리셋
    setTimeLeft(10 * 60);
    setShowTaskInput(true);
    setCurrentTask('');
  };

  const editCycle = (cycle) => {
    setEditingCycle({...cycle});
    setExpandedCycles(prev => new Set([...prev, cycle.id]));
  };

  const saveEdit = () => {
    setCyclesByDate(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map(cycle => 
        cycle.id === editingCycle.id ? editingCycle : cycle
      )
    }));
    setEditingCycle(null);
  };

  const deleteCycle = (id) => {
    setCyclesByDate(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(cycle => cycle.id !== id)
    }));
    setEditingCycle(null);
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // 모든 데이터 초기화 함수
  const clearAllData = () => {
    if (window.confirm('모든 집중 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setCyclesByDate({});
      localStorage.removeItem('focusTimerCycles');
      setExpandedCycles(new Set());
      setEditingCycle(null);
    }
  };

  // 체크리스트 관련 함수들
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const toggleEditMode = () => {
    setEditMode(true);
    // 편집 모드 진입 시 아침 점검 섹션을 자동으로 열어줌
    setExpandedSections(prev => ({
      ...prev,
      morning: true
    }));
  };

  const completeEdit = () => {
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const toggleDailySystem = () => {
    setIsDailySystemExpanded(!isDailySystemExpanded);
  };

  // 일일 점검 섹션 복사 함수
  const copySectionContent = async (sectionKey) => {
    const sectionData = checkData[selectedDate]?.[sectionKey];
    const sectionTitle = checklistTemplate[sectionKey].title;
    let content = `# ${sectionTitle}\n\n`;
    
    if (!sectionData) {
      content += '아직 작성된 내용이 없습니다.\n\n';
    } else {
      checklistTemplate[sectionKey].questions.forEach((question, index) => {
        const answer = sectionData[index] || '';
        content += `## ${question}\n${answer || '답변이 없습니다.'}\n\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(content);
      alert(`${sectionTitle} 내용이 클립보드에 복사되었습니다.`);
    } catch (err) {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다.');
    }
  };

  // 선택된 날짜에 체크리스트 데이터가 있는지 확인
  const hasCheckDataForSelectedDate = checkData[selectedDate] && 
    Object.keys(checkData[selectedDate]).some(section => 
      checkData[selectedDate][section] && 
      Object.values(checkData[selectedDate][section]).some(answer => answer && answer.trim())
    );

  const toggleExpand = (id) => {
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 날짜 변경 함수들
  const changeDate = (direction) => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
    
    // 날짜 변경 시 타이머 초기화
    setIsRunning(false);
    setTimeLeft(10 * 60);
    setShowTaskInput(true);
    setShowReflection(false);
    setCurrentTask('');
    setEditingCycle(null);
  };

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    // 오늘로 이동 시 타이머 초기화
    setIsRunning(false);
    setTimeLeft(10 * 60);
    setShowTaskInput(true);
    setShowReflection(false);
    setCurrentTask('');
    setEditingCycle(null);
  };

  // 선택된 날짜의 사이클들 가져오기
  const currentDateCycles = cyclesByDate[selectedDate] || [];
  
  // 시간순으로 정렬
  const sortedCycles = [...currentDateCycles].sort((a, b) => a.startTime - b.startTime);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return '오늘 (' + date.toLocaleDateString('ko-KR') + ')';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return '어제 (' + date.toLocaleDateString('ko-KR') + ')';
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* 풀 네비게이션 헤더 */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 이전 날짜 버튼 */}
          <button
            onClick={() => changeDate('prev')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
              <span className="hidden sm:inline">이전 날짜</span>
          </button>
          
            {/* 중앙: 날짜 정보 */}
            <div className="text-center flex-1 mx-4">
              <div className="flex items-center gap-3 justify-center mb-1">
                <Calendar className="text-blue-500" size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatDate(selectedDate)}
              </h2>
            </div>
              <div className="text-sm text-gray-600">
                {sortedCycles.length}개 세션 완료
                {Object.keys(cyclesByDate).length > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    • 총 {Object.keys(cyclesByDate).length}일 기록
                  </span>
                )}
            </div>
            {selectedDate !== new Date().toISOString().split('T')[0] && (
              <button
                onClick={goToToday}
                  className="text-xs text-blue-500 hover:text-blue-700 underline mt-1"
              >
                오늘로 이동
              </button>
            )}
          </div>
          
            {/* 오른쪽: 다음 날짜 버튼과 설정 */}
            <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate('next')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
                <span className="hidden sm:inline">다음 날짜</span>
            <ChevronRight size={20} />
          </button>
              
              {Object.keys(cyclesByDate).length > 0 && (
                <button
                  onClick={clearAllData}
                  className="px-3 py-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="모든 기록 삭제"
                >
                  삭제
                </button>
              )}
            </div>
        </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 좌우 레이아웃 */}
      <div className="max-w-7xl mx-auto p-6">
        <div className={`grid grid-cols-1 gap-6 ${isDailySystemExpanded ? 'lg:grid-cols-2' : 'lg:grid-cols-1 lg:max-w-4xl lg:mx-auto'}`}>
          
          {/* 왼쪽: 일일 점검 시스템 */}
          {isDailySystemExpanded ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 self-start">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDailySystem}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="일일 점검 시스템 접기"
                >
                  <ChevronRight size={16} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">일일 점검 시스템</h1>
              </div>
              <div className="flex items-center gap-2">
                {(hasCheckDataForSelectedDate || editMode) && (
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
            {hasCheckDataForSelectedDate || editMode ? (
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
                          copySectionContent(sectionKey);
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
                                onChange={(e) => updateAnswer(sectionKey, index, e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical max-h-[500px]"
                                placeholder="답변을 입력해주세요... (마크다운 문법 지원: **굵게**, *기울임*, - 목록, 1. 번호목록 등)"
                              />
                            ) : (
                              <div className="text-gray-700 leading-relaxed">
                                {checkData[selectedDate]?.[sectionKey]?.[index] ? (
                                  <div className="text-gray-800 text-base leading-relaxed prose prose-sm max-w-none">
                                    <ReactMarkdown
                                      components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="text-gray-800">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                                        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                                        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">{children}</blockquote>,
                                        h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mb-2">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-base font-bold text-gray-900 mb-1">{children}</h3>,
                                      }}
                                    >
                                      {checkData[selectedDate][sectionKey][index]}
                                    </ReactMarkdown>
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
          ) : (
            /* 접혔을 때의 동그란 버튼 */
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
              <button
                onClick={toggleDailySystem}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
                title="일일 점검 시스템 펼치기"
              >
                <Calendar size={24} />
              </button>
            </div>
          )}

          {/* 오른쪽: 10분 집중 타이머 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 flex items-center justify-center gap-3">
          <Clock className="text-blue-500" />
          10분 집중 타이머
        </h1>

        {/* Task Input */}
        {showTaskInput && (
          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
              <Target />
              이번 10분 동안 어떤 작업에 집중하시겠어요?
            </h2>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="w-full p-4 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              placeholder="예: 보고서 작성, 코딩, 독서 등..."
              onKeyPress={(e) => e.key === 'Enter' && startTimer()}
            />
            <button
              onClick={startTimer}
              disabled={!currentTask.trim()}
              className="mt-4 w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={20} />
              시작하기
            </button>
          </div>
        )}

        {/* Timer Display */}
        {!showTaskInput && !showReflection && (
          <div className="text-center mb-8">
            <div className="text-6xl font-mono font-bold mb-4 text-gray-800">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xl text-gray-600 mb-6">
              현재 작업: <span className="font-semibold text-blue-600">{currentTask}</span>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={isRunning ? pauseTimer : () => setIsRunning(true)}
                className="bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                {isRunning ? '일시정지' : '시작'}
              </button>
              <button
                onClick={() => {
                  console.log('중단 버튼 클릭됨');
                  console.log('stopTimer 호출 전 상태:', { showTaskInput, showReflection });
                  setIsRunning(false);
                  setShowReflection(true);
                  console.log('회고 화면으로 이동 설정 완료');
                }}
                className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Square size={20} />
                중단
              </button>
            </div>
          </div>
        )}

        {/* Reflection Form */}
        {showReflection && (
          <div className="mb-8 p-6 bg-green-50 rounded-xl">
            <h2 className="text-xl font-semibold mb-6 text-green-700 flex items-center gap-2">
              <BookOpen />
              10분 집중 시간이 끝났어요! 회고를 작성해주세요
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이번 작업에서 이뤄낸 결과
                </label>
                <textarea
                  value={reflection.result}
                  onChange={(e) => setReflection(prev => ({...prev, result: e.target.value}))}
                  className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical max-h-[500px]"
                  rows={3}
                  placeholder="어떤 성과를 얻으셨나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작업을 방해한 요소들
                </label>
                <textarea
                  value={reflection.distractions}
                  onChange={(e) => setReflection(prev => ({...prev, distractions: e.target.value}))}
                  className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical max-h-[500px]"
                  rows={3}
                  placeholder="어떤 것들이 집중을 방해했나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이번 10분에 대한 전체적인 회고
                </label>
                <textarea
                  value={reflection.thoughts}
                  onChange={(e) => setReflection(prev => ({...prev, thoughts: e.target.value}))}
                  className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical max-h-[500px]"
                  rows={3}
                  placeholder="어떤 생각이 드시나요? 다음에는 어떻게 개선할 수 있을까요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                />
              </div>
              
              <button
                onClick={saveReflection}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                회고 저장하기
              </button>
            </div>
          </div>
        )}

        {/* 집중 기록 - 타이머 섹션 내부에 통합 */}
      {sortedCycles.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <BookOpen className="text-blue-500" size={20} />
            {formatDate(selectedDate)} 집중 기록
          </h2>
          <div className="space-y-2">
            {sortedCycles.map((cycle, index) => {
              const isExpanded = expandedCycles.has(cycle.id);
              const startTime = cycle.startTime.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              const endTime = cycle.endTime.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              return (
                <div key={cycle.id} className="border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="p-3 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-between"
                    onClick={() => toggleExpand(cycle.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-500 bg-blue-100 px-2 py-1 rounded">
                        {index + 1}cycle
                      </span>
                      <span className="font-medium text-gray-700">
                        {startTime} - {endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingCycle && editingCycle.id === cycle.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEdit();
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            저장
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCycle(null);
                            }}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                          >
                            취소
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCycle(cycle.id);
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            삭제
                          </button>
                        </div>
                      ) : (
                            <div className="flex gap-1">
                            
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editCycle(cycle);
                          }}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                          수정
                        </button>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCycle(cycle.id);
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              삭제
                            </button>
                          </div>
                      )}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-100">
                      {editingCycle && editingCycle.id === cycle.id ? (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                              <Edit size={18} />
                              집중 기록 수정
                            </h3>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  작업 내용
                                </label>
                          <input
                            type="text"
                            value={editingCycle.task}
                            onChange={(e) => setEditingCycle(prev => ({...prev, task: e.target.value}))}
                                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  placeholder="작업 내용을 입력해주세요"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  이번 작업에서 이뤄낸 결과
                                </label>
                          <textarea
                            value={editingCycle.result}
                            onChange={(e) => setEditingCycle(prev => ({...prev, result: e.target.value}))}
                                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-vertical max-h-[500px]"
                                  rows={3}
                                  placeholder="어떤 성과를 얻으셨나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  작업을 방해한 요소들
                                </label>
                          <textarea
                            value={editingCycle.distractions}
                            onChange={(e) => setEditingCycle(prev => ({...prev, distractions: e.target.value}))}
                                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-vertical max-h-[500px]"
                                  rows={3}
                                  placeholder="어떤 것들이 집중을 방해했나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  이번 10분에 대한 전체적인 회고
                                </label>
                          <textarea
                            value={editingCycle.thoughts}
                            onChange={(e) => setEditingCycle(prev => ({...prev, thoughts: e.target.value}))}
                                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-vertical max-h-[500px]"
                                  rows={3}
                                  placeholder="어떤 생각이 드시나요? 다음에는 어떻게 개선할 수 있을까요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                                />
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => setEditingCycle(null)}
                                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                >
                                  저장하기
                                </button>
                                <button
                                  onClick={() => setEditingCycle(null)}
                                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                        </div>
                      ) : (
                        <div className="space-y-4 mt-4">
                          {/* 작업 내용 */}
                            <div className="pb-4 border-b border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                              <Target size={16} className="text-blue-600" />
                                <span className="font-semibold text-gray-800">작업 내용</span>
                            </div>
                            <p className="text-gray-700 ml-6">{cycle.task}</p>
                          </div>

                          {/* 결과 */}
                            <div className="py-4 border-b border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                              <BookOpen size={16} className="text-green-600" />
                                <span className="font-semibold text-gray-800">달성한 결과</span>
                              </div>
                              <div className="text-gray-700 ml-6 prose prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-gray-800">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">{children}</blockquote>,
                                    h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-bold text-gray-900 mb-1">{children}</h3>,
                                  }}
                                >
                                  {cycle.result}
                                </ReactMarkdown>
                            </div>
                          </div>

                          {/* 방해요소 */}
                            <div className="py-4 border-b border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                              <AlertCircle size={16} className="text-red-600" />
                                <span className="font-semibold text-gray-800">방해 요소</span>
                              </div>
                              <div className="text-gray-700 ml-6 prose prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-gray-800">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">{children}</blockquote>,
                                    h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-bold text-gray-900 mb-1">{children}</h3>,
                                  }}
                                >
                                  {cycle.distractions}
                                </ReactMarkdown>
                            </div>
                          </div>

                          {/* 회고 */}
                            <div className="py-4 border-b border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                              <Clock size={16} className="text-purple-600" />
                                <span className="font-semibold text-gray-800">회고 및 개선점</span>
                              </div>
                              <div className="text-gray-700 ml-6 prose prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-gray-800">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">{children}</blockquote>,
                                    h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-bold text-gray-900 mb-1">{children}</h3>,
                                  }}
                                >
                                  {cycle.thoughts}
                                </ReactMarkdown>
                            </div>
                          </div>

                          {/* 소요시간 */}
                            <div className="pt-4 text-center">
                            <span className="text-sm text-gray-600 font-medium">
                              소요시간: {Math.floor(cycle.timeSpent / 60)}분 {cycle.timeSpent % 60}초
                            </span>
                          </div>
                        </div>
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
        </div>
      </div>

    </div>
  );
};

export default FocusTimer;