/**
 * 타이머 훅
 * UI 독립적인 타이머 상태 관리 및 액션 제공
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { TimerState, TimerStatus } from '../../domain/types';
import { 
  createInitialTimerState,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  resetTimer,
  completeTimer,
  syncTimerState,
  calculateTimer,
  validateTimerState
} from '../../domain/timer-logic';
import { INotificationService } from '../../domain/repositories';

/**
 * 타이머 훅 반환 타입
 */
export interface UseTimerReturn {
  // 원시 상태 (UI가 자유롭게 사용)
  state: {
    status: TimerStatus;
    timeLeft: number;
    initialTime: number;
    startTime: Date | null;
    task: string;
  };
  
  // 순수 액션 함수들
  actions: {
    setTask: (task: string) => void;
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    reset: () => void;
    complete: (reflection: ReflectionData) => Promise<void>;
  };
  
  // 유틸리티 (UI가 필요한 형태로 변환 가능)
  computed: {
    formattedTime: string;
    progress: number;  // 0-100
    isRunning: boolean;
    isPaused: boolean;
    isCompleted: boolean;
    canStart: boolean;
    canPause: boolean;
    canStop: boolean;
  };
}

/**
 * 타이머 훅 Props
 */
interface UseTimerProps {
  notificationService: INotificationService;
  onSessionComplete?: (session: any) => void;
  initialTime?: number;
}

/**
 * 타이머 훅
 */
export function useTimer({ 
  notificationService, 
  onSessionComplete,
  initialTime = 600 
}: UseTimerProps): UseTimerReturn {
  // 타이머 상태
  const [timerState, setTimerState] = useState<TimerState>(
    createInitialTimerState(initialTime, '')
  );

  // 타이머 관리
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveTimeRef = useRef<Date | null>(null);

  /**
   * 모든 interval 정리
   */
  const clearAllIntervals = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  /**
   * 타이머 동기화
   */
  const syncTimer = useCallback(() => {
    if (timerState.status !== 'RUNNING') return;

    const now = new Date();
    const newState = syncTimerState(timerState, now, lastActiveTimeRef.current);
    
    if (newState.status !== timerState.status || newState.timeLeft !== timerState.timeLeft) {
      setTimerState(newState);
      
      // 타이머 완료 시 알림
      if (newState.status === 'COMPLETED') {
        notificationService.showTimerCompletionNotification(timerState.task);
      }
    }
  }, [timerState, notificationService]);

  /**
   * 작업 설정
   */
  const setTask = useCallback((task: string) => {
    setTimerState(prev => ({ ...prev, task }));
  }, []);

  /**
   * 타이머 시작
   */
  const start = useCallback(() => {
    if (!timerState.task.trim()) return;

    const startTime = new Date();
    const newState = startTimer(timerState, startTime);
    
    setTimerState(newState);
    lastActiveTimeRef.current = startTime;

    // 즉시 첫 동기화 실행
    setTimeout(() => syncTimer(), 100);
  }, [timerState, syncTimer]);

  /**
   * 타이머 일시정지
   */
  const pause = useCallback(() => {
    clearAllIntervals();
    const now = new Date();
    const newState = pauseTimer(timerState, now);
    setTimerState(newState);
  }, [timerState, clearAllIntervals]);

  /**
   * 타이머 재개
   */
  const resume = useCallback(() => {
    const startTime = new Date();
    const newState = resumeTimer(timerState, startTime);
    setTimerState(newState);
    lastActiveTimeRef.current = startTime;

    // 즉시 첫 동기화 실행
    setTimeout(() => syncTimer(), 100);
  }, [timerState, syncTimer]);

  /**
   * 타이머 중단
   */
  const stop = useCallback(() => {
    clearAllIntervals();
    const now = new Date();
    const newState = stopTimer(timerState, now);
    setTimerState(newState);
  }, [timerState, clearAllIntervals]);

  /**
   * 타이머 리셋
   */
  const reset = useCallback(() => {
    clearAllIntervals();
    const newState = resetTimer(timerState);
    setTimerState(newState);
  }, [timerState, clearAllIntervals]);

  /**
   * 타이머 완료 (세션 저장)
   */
  const complete = useCallback(async (reflection: ReflectionData) => {
    try {
      const now = new Date();
      const newState = completeTimer(timerState, now);
      setTimerState(newState);

      // 세션 생성 및 저장
      if (onSessionComplete) {
        const session = {
          task: timerState.task,
          startTime: timerState.startTime || now,
          endTime: now,
          duration: timerState.initialTime - timerState.timeLeft,
          result: reflection.result,
          distractions: reflection.distractions,
          thoughts: reflection.thoughts,
          date: now.toISOString().split('T')[0]
        };
        await onSessionComplete(session);
      }

      // 알림 표시
      await notificationService.showTimerCompletionNotification(timerState.task);

    } catch (error) {
      console.error('타이머 완료 처리 실패:', error);
      throw error;
    }
  }, [timerState, onSessionComplete, notificationService]);

  /**
   * Page Visibility API 처리
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerState.status === 'RUNNING') {
        console.log('Tab became active, syncing timer...');
        syncTimer();
      } else if (document.visibilityState === 'hidden') {
        lastActiveTimeRef.current = new Date();
      }
    };

    const handleFocus = () => {
      if (timerState.status === 'RUNNING') {
        console.log('Window focused, syncing timer...');
        syncTimer();
      }
    };

    const handleBlur = () => {
      lastActiveTimeRef.current = new Date();
    };

    // 이벤트 리스너 등록
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // 정기적인 동기화 (1초마다)
    const syncInterval = setInterval(() => {
      if (timerState.status === 'RUNNING') {
        syncTimer();
      }
    }, 1000);
    
    timerIntervalRef.current = syncInterval;

    return () => {
      // 이벤트 리스너 정리
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      // 모든 interval 정리
      clearAllIntervals();
    };
  }, [timerState, syncTimer, clearAllIntervals]);

  /**
   * 타이머 상태 변경 감지
   */
  useEffect(() => {
    if (timerState.status === 'COMPLETED') {
      clearAllIntervals();
    }
  }, [timerState, clearAllIntervals]);

  // 계산된 값들
  const calculation = calculateTimer(timerState, new Date());
  
  return {
    // 원시 상태
    state: {
      status: timerState.status,
      timeLeft: timerState.timeLeft,
      initialTime: timerState.initialTime,
      startTime: timerState.startTime,
      task: timerState.task
    },
    
    // 액션
    actions: {
      setTask,
      start,
      pause,
      resume,
      stop,
      reset,
      complete
    },
    
    // 계산된 값
    computed: {
      formattedTime: calculation.formattedTime,
      progress: calculation.progress,
      isRunning: timerState.status === 'RUNNING',
      isPaused: timerState.status === 'PAUSED',
      isCompleted: timerState.status === 'COMPLETED',
      canStart: timerState.status === 'IDLE' || timerState.status === 'PAUSED',
      canPause: timerState.status === 'RUNNING',
      canStop: timerState.status === 'RUNNING' || timerState.status === 'PAUSED'
    }
  };
}
