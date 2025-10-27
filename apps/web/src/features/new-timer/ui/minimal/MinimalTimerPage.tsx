/**
 * 미니멀 타이머 페이지
 * 모든 컴포넌트를 조합한 통합 페이지
 */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTimerContext } from '../../application/context/TimerContext';
import { useTimer } from '../../application/hooks/useTimer';
import { useTimerSessions } from '../../application/hooks/useTimerSessions';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TaskInput } from './TaskInput';
import { ReflectionForm } from './ReflectionForm';
import { DateSelector } from './DateSelector';
import { SessionList } from './SessionList';
import { TimerSession, ReflectionData } from '../../domain/types';
import { createSession } from '../../domain/session-manager';
import { ExportButton } from '../../../session-export/ui/ExportButton';

/**
 * 미니멀 타이머 페이지 Props
 */
interface MinimalTimerPageProps {
  sessionRepository: any;
  notificationService: any;
}

/**
 * 미니멀 타이머 페이지
 */
export function MinimalTimerPage({
  sessionRepository,
  notificationService,
}: MinimalTimerPageProps) {
  const { selectedDate, setSelectedDate } = useTimerContext();
  const [showReflection, setShowReflection] = useState(false);

  // 타이머 훅
  const timer = useTimer({
    notificationService,
    onSessionComplete: async (sessionData) => {
      const session = createSession(
        sessionData.task,
        sessionData.startTime,
        sessionData.endTime,
        sessionData,
        sessionData.date,
      );
      await sessions.actions.create(session);
      setShowReflection(false);
    },
  });

  // 세션 훅
  const sessions = useTimerSessions({
    sessionRepository,
    initialDate: selectedDate,
  });

  // 타이머 시작 핸들러
  const handleStart = useCallback(() => {
    if (!timer.state.task.trim()) return;
    timer.actions.start();
  }, [timer]);

  // 타이머 완료 핸들러
  const handleComplete = useCallback(
    async (reflection: ReflectionData) => {
      try {
        await timer.actions.complete(reflection);
        setShowReflection(false);
      } catch (error) {
        console.error('타이머 완료 실패:', error);
      }
    },
    [timer],
  );

  // 타이머 리셋 핸들러
  const handleReset = useCallback(() => {
    timer.actions.reset();
    setShowReflection(false);
  }, [timer]);

  // 세션 편집 핸들러
  const handleEditSession = useCallback(async (id: string) => {
    // 간단한 편집 모달이나 인라인 편집 구현
    console.log('세션 편집:', id);
  }, []);

  // 세션 삭제 핸들러
  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await sessions.actions.delete(id);
      } catch (error) {
        console.error('세션 삭제 실패:', error);
      }
    },
    [sessions],
  );

  // 현재 날짜의 세션들
  const currentDateSessions = sessions.computed.byDate(selectedDate);
  const sortedSessions = sessions.computed.sortedByTime(currentDateSessions);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='max-w-4xl mx-auto flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>10분 집중 타이머</h1>
            <p className='text-gray-600'>한 번에 하나의 작업에 집중하세요</p>
          </div>
          <Link
            to='/'
            className='bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors'
          >
            ← 홈으로
          </Link>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-6 py-8'>
        {/* 날짜 선택 및 노션 동기화 */}
        <div className='flex items-center justify-between mb-4'>
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <ExportButton
            sessions={sortedSessions}
            date={selectedDate}
            onSuccess={() => console.log('마크다운 내보내기 완료')}
          />
        </div>

        {/* 타이머 섹션 */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8'>
          {/* 타이머 디스플레이 */}
          <div className='mb-8'>
            <TimerDisplay
              time={timer.computed.formattedTime}
              task={timer.state.task}
              status={timer.state.status}
            />
          </div>

          {/* 작업 입력 (IDLE 상태일 때만) */}
          {timer.state.status === 'IDLE' && (
            <div className='mb-6'>
              <TaskInput
                value={timer.state.task}
                onChange={timer.actions.setTask}
                onSubmit={handleStart}
              />
              <button
                onClick={handleStart}
                disabled={!timer.state.task.trim()}
                className='mt-4 w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors'
              >
                시작하기
              </button>
            </div>
          )}

          {/* 타이머 컨트롤 */}
          {timer.state.status !== 'IDLE' && (
            <div className='mb-6'>
              <TimerControls
                status={timer.state.status}
                canStart={timer.computed.canStart}
                canPause={timer.computed.canPause}
                canStop={timer.computed.canStop}
                onStart={timer.actions.start}
                onPause={timer.actions.pause}
                onResume={timer.actions.resume}
                onStop={() => {
                  timer.actions.stop();
                  setShowReflection(true);
                }}
              />
            </div>
          )}

          {/* 회고 폼 */}
          {showReflection && (
            <div className='mb-6'>
              <ReflectionForm
                task={timer.state.task}
                onSave={handleComplete}
                onCancel={handleReset}
              />
            </div>
          )}
        </div>

        {/* 세션 히스토리 */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>
            완료된 세션 ({sortedSessions.length}개)
          </h2>

          <SessionList
            sessions={sortedSessions}
            onEdit={handleEditSession}
            onDelete={handleDeleteSession}
            loading={sessions.loading}
            emptyMessage='이 날짜에는 완료된 세션이 없습니다.'
          />
        </div>
      </div>
    </div>
  );
}
