import React from 'react';
import { Play, Pause, Square, Clock, Target, BookOpen } from 'lucide-react';
import { TimerState, ReflectionData } from '../domain/types';

interface TimerSectionProps {
  timerState: TimerState;
  currentTask: string;
  reflection: ReflectionData;
  notificationPermission: string;
  isNotificationSupported: boolean;
  setCurrentTask: (task: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  saveReflection: () => Promise<void>;
  updateReflection: (field: keyof ReflectionData, value: string) => void;
  formatTime: (seconds: number) => string;
  requestNotificationPermission: () => Promise<string>;
}

export const TimerSection: React.FC<TimerSectionProps> = ({
  timerState,
  currentTask,
  reflection,
  notificationPermission,
  isNotificationSupported,
  setCurrentTask,
  startTimer,
  pauseTimer,
  stopTimer,
  saveReflection,
  updateReflection,
  formatTime,
  requestNotificationPermission,
}) => {
  const showTaskInput = timerState.status === 'TASK_INPUT';
  const showReflection = timerState.status === 'REFLECTION';
  const isRunning = timerState.status === 'RUNNING';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 flex items-center justify-center gap-3">
          <Clock className="text-blue-500" />
          10분 집중 타이머
        </h1>

        {/* Notification Permission */}
        {isNotificationSupported && notificationPermission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-yellow-700 text-sm">
                {notificationPermission === 'denied'
                  ? '🔕 알림이 차단되었습니다. 브라우저 설정에서 허용해주세요.'
                  : '🔔 타이머 완료 시 알림을 받으려면 권한을 허용해주세요.'
                }
              </span>
              {notificationPermission !== 'denied' && (
                <button
                  onClick={requestNotificationPermission}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                >
                  알림 허용
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
            {formatTime(timerState.timeLeft)}
          </div>
          <div className="text-xl text-gray-600 mb-4">
            현재 작업: <span className="font-semibold text-blue-600">{currentTask}</span>
          </div>
          {timerState.startTime && (
            <div className="text-sm text-gray-500 mb-6">
              시작 시간: <span className="font-medium text-gray-700">
                {timerState.startTime.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? '일시정지' : '시작'}
            </button>
            <button
              onClick={stopTimer}
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
                onChange={(e) => updateReflection('result', e.target.value)}
                className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical max-h-[500px]"
                rows={3}
                placeholder="작업을 통해 어떤 성과를 얻으셨나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작업을 방해한 요소들
              </label>
              <textarea
                value={reflection.distractions}
                onChange={(e) => updateReflection('distractions', e.target.value)}
                className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical max-h-[500px]"
                rows={3}
                placeholder="작업 중에 어떤 것들이 집중을 방해했나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이번 10분에 대한 전체적인 회고
              </label>
              <textarea
                value={reflection.thoughts}
                onChange={(e) => updateReflection('thoughts', e.target.value)}
                className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical max-h-[500px]"
                rows={3}
                placeholder="작업에 대한 전체적인 생각은 어떠신가요? 다음에는 어떻게 개선할 수 있을까요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
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
    </div>
  );
};
