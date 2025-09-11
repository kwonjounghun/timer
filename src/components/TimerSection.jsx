import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Clock, Target, BookOpen, ChevronDown, ChevronUp, Edit, AlertCircle } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useAudio } from '../hooks/useAudio';
import { useFocusCycles } from '../hooks/useFocusCycles';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatDate, formatTime as formatTimeFromUtils } from '../utils/dateUtils';

export const TimerSection = ({ selectedDate }) => {
  const { timeLeft, isRunning, startTimer, pauseTimer, resetTimer, formatTime } = useTimer();
  const { playNotification } = useAudio();
  const { 
    cyclesByDate, 
    expandedCycles, 
    editingCycle, 
    addCycle, 
    editCycle, 
    saveEdit, 
    deleteCycle, 
    toggleExpand, 
    setEditingCycle 
  } = useFocusCycles();
  
  const [currentTask, setCurrentTask] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState({
    result: '',
    distractions: '',
    thoughts: ''
  });
  const [timerStartTime, setTimerStartTime] = useState(null);

  const handleStartTimer = () => {
    if (currentTask.trim()) {
      setShowTaskInput(false);
      setTimerStartTime(new Date()); // 타이머 시작 시간 저장
      startTimer();
    }
  };

  const handlePauseTimer = () => {
    pauseTimer();
  };

  const handleStopTimer = () => {
    pauseTimer();
    setShowReflection(true);
  };

  const handleTimerComplete = useCallback(() => {
    pauseTimer();
    setShowReflection(true);
    playNotification();
  }, [pauseTimer, playNotification]);

  // 타이머 완료 감지
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning, handleTimerComplete]);

  const saveReflection = () => {
    const endTime = new Date();
    const startTime = timerStartTime || new Date(endTime.getTime() - (10 * 60 - timeLeft) * 1000);
    
    const newCycle = {
      date: selectedDate,
      task: currentTask,
      startTime: startTime,
      endTime: endTime,
      timeSpent: 10 * 60 - timeLeft,
      result: reflection.result,
      distractions: reflection.distractions,
      thoughts: reflection.thoughts
    };
    
    addCycle(newCycle);
    
    setShowReflection(false);
    setReflection({ result: '', distractions: '', thoughts: '' });
    
    // 초기 상태로 리셋
    resetTimer();
    setShowTaskInput(true);
    setCurrentTask('');
    setTimerStartTime(null); // 타이머 시작 시간 초기화
  };

  return (
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
            onKeyPress={(e) => e.key === 'Enter' && handleStartTimer()}
          />
          <button
            onClick={handleStartTimer}
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
              onClick={isRunning ? handlePauseTimer : () => {
                if (!timerStartTime) {
                  setTimerStartTime(new Date());
                }
                startTimer();
              }}
              className="bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? '일시정지' : '시작'}
            </button>
            <button
              onClick={handleStopTimer}
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
          <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
            <BookOpen />
            10분 집중 시간이 끝났어요! 회고를 작성해주세요
          </h2>
          
          {/* 작업 내용 표시 */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-green-600 w-5 h-5" />
              <span className="text-sm font-medium text-gray-600">이번 작업 내용</span>
            </div>
            <p className="text-lg font-semibold text-gray-800 bg-gray-50 p-3 rounded-md border-l-4 border-green-400">
              {currentTask || '작업 내용이 없습니다'}
            </p>
          </div>
          
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
                placeholder={`작업을 통해 어떤 성과를 얻으셨나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)`}
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
                placeholder={`작업 중에 어떤 것들이 집중을 방해했나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)`}
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
                placeholder={`작업에 대한 전체적인 생각은 어떠신가요? 다음에는 어떻게 개선할 수 있을까요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)`}
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
      {(() => {
        const currentDateCycles = cyclesByDate[selectedDate] || [];
        const sortedCycles = [...currentDateCycles].sort((a, b) => a.startTime - b.startTime);
        
        if (sortedCycles.length === 0) return null;
        
        return (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <BookOpen className="text-blue-500" size={20} />
              {formatDate(selectedDate)} 집중 기록
            </h2>
            <div className="space-y-2">
              {sortedCycles.map((cycle, index) => {
                const isExpanded = expandedCycles.has(cycle.id);
                const startTime = formatTimeFromUtils(cycle.startTime);
                const endTime = formatTimeFromUtils(cycle.endTime);
                
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
                                saveEdit(selectedDate);
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
                                deleteCycle(selectedDate, cycle.id);
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
                                deleteCycle(selectedDate, cycle.id);
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
                              <div className="text-gray-700 ml-6">
                                <MarkdownRenderer content={cycle.result} />
                              </div>
                            </div>

                            {/* 방해요소 */}
                            <div className="py-4 border-b border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle size={16} className="text-red-600" />
                                <span className="font-semibold text-gray-800">방해 요소</span>
                              </div>
                              <div className="text-gray-700 ml-6">
                                <MarkdownRenderer content={cycle.distractions} />
                              </div>
                            </div>

                            {/* 회고 */}
                            <div className="py-4 border-b border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} className="text-purple-600" />
                                <span className="font-semibold text-gray-800">회고 및 개선점</span>
                              </div>
                              <div className="text-gray-700 ml-6">
                                <MarkdownRenderer content={cycle.thoughts} />
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
        );
      })()}
    </div>
  );
};
