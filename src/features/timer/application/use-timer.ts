import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  TimerState, 
  ReflectionData, 
  FocusCycle, 
  TimerAction,
  TimerStatus 
} from '../domain/types';
import { 
  createInitialTimerState, 
  timerReducer, 
  createFocusCycleFromState,
  syncTimerState,
  isTimerRunning,
  isTimerCompleted
} from '../domain/timer-state-machine';
import { formatTime } from '../domain/timer-calculator';
import { firebaseFocusCycleRepository } from '../infrastructure/firebase-repository';
import { notificationService, requestNotificationPermission } from '../infrastructure/notification-service';

/**
 * 타이머 애플리케이션 Hook
 */
export function useTimer(selectedDate: string) {
  // 타이머 상태
  const [timerState, setTimerState] = useState<TimerState>(createInitialTimerState());
  const [currentTask, setCurrentTask] = useState('');
  const [reflection, setReflection] = useState<ReflectionData>({
    result: '',
    distractions: '',
    thoughts: ''
  });

  // 타이머 관리
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveTimeRef = useRef<Date | null>(null);

  /**
   * 모든 interval 정리
   */
  const clearAllIntervals = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  /**
   * 타이머 동기화
   */
  const syncTimer = useCallback(() => {
    if (!isTimerRunning(timerState)) return;

    const now = new Date();
    const newState = syncTimerState(timerState, now, lastActiveTimeRef.current);
    
    if (newState.status !== timerState.status || newState.timeLeft !== timerState.timeLeft) {
      setTimerState(newState);
      
      // 타이머 완료 시 알림
      if (isTimerCompleted(newState)) {
        notificationService.showNotification(currentTask);
      }
    }
  }, [timerState, currentTask]);

  /**
   * 타이머 시작
   */
  const startTimer = useCallback(() => {
    if (!currentTask.trim()) return;

    const startTime = new Date();
    const newState = timerReducer(timerState, { type: 'START_TIMER', payload: startTime });
    
    setTimerState(newState);
    lastActiveTimeRef.current = startTime;

    // 즉시 첫 동기화 실행
    setTimeout(() => syncTimer(), 100);
  }, [currentTask, timerState, syncTimer]);

  /**
   * 타이머 일시정지
   */
  const pauseTimer = useCallback(() => {
    clearAllIntervals();
    const newState = timerReducer(timerState, { type: 'PAUSE_TIMER' });
    setTimerState(newState);
  }, [timerState, clearAllIntervals]);

  /**
   * 타이머 중단
   */
  const stopTimer = useCallback(() => {
    clearAllIntervals();
    
    const endTime = new Date();
    const newState = timerReducer(timerState, { type: 'STOP_TIMER', payload: endTime });
    setTimerState(newState);
  }, [timerState, clearAllIntervals]);

  /**
   * 타이머 리셋
   */
  const resetTimer = useCallback(() => {
    clearAllIntervals();
    const newState = timerReducer(timerState, { type: 'RESET_TIMER' });
    setTimerState(newState);
    setCurrentTask('');
    setReflection({ result: '', distractions: '', thoughts: '' });
  }, [timerState, clearAllIntervals]);

  /**
   * 회고 데이터 업데이트
   */
  const updateReflection = useCallback((field: keyof ReflectionData, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * 회고 저장
   */
  const saveReflection = useCallback(async () => {
    try {
      const cycle = createFocusCycleFromState(timerState, currentTask, reflection, selectedDate);
      await firebaseFocusCycleRepository.saveCycle(cycle);
      
      // 커스텀 이벤트 발생 (다른 컴포넌트에서 사용)
      window.dispatchEvent(new CustomEvent('cycleAdded', { detail: cycle }));
      
      resetTimer();
    } catch (error) {
      console.error('회고 저장 실패:', error);
      throw error;
    }
  }, [timerState, currentTask, reflection, selectedDate, resetTimer]);

  /**
   * Page Visibility API 처리
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTimerRunning(timerState)) {
        console.log('Tab became active, syncing timer...');
        syncTimer();
      } else if (document.visibilityState === 'hidden') {
        lastActiveTimeRef.current = new Date();
      }
    };

    const handleFocus = () => {
      if (isTimerRunning(timerState)) {
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
      if (isTimerRunning(timerState)) {
        syncTimer();
      }
    }, 1000);
    
    syncIntervalRef.current = syncInterval;

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
    if (isTimerCompleted(timerState)) {
      clearAllIntervals();
    }
  }, [timerState, clearAllIntervals]);

  return {
    // 상태
    timerState,
    currentTask,
    reflection,
    notificationPermission: notificationService.permission,
    isNotificationSupported: notificationService.isSupported,

    // 액션
    setCurrentTask,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    saveReflection,
    updateReflection,

    // 유틸리티
    formatTime,
    requestNotificationPermission,
  };
}
