import { useState, useCallback, useEffect, useRef } from 'react';
import { useAudio } from '../../../adapters/react/useAudio';
import { hybridStorage } from '../../../utils/hybridStorage';

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  initialTime: number;
}

export interface ReflectionData {
  result: string;
  distractions: string;
  thoughts: string;
}

export interface TimerLogic {
  // Timer state
  timerState: TimerState;
  currentTask: string;
  showTaskInput: boolean;
  showReflection: boolean;
  reflection: ReflectionData;
  timerStartTime: Date | null;
  timerEndTime: Date | null;

  // Timer actions
  setCurrentTask: (task: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  saveReflection: () => Promise<void>;

  // Reflection actions
  updateReflection: (field: keyof ReflectionData, value: string) => void;

  // Utility
  formatTime: (seconds: number) => string;
}

export const useTimerLogic = (selectedDate: string, addCycle?: (cycle: any) => void): TimerLogic => {
  const audioHook = useAudio();
  const { playNotification } = audioHook;

  // Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: 10 * 60, // 10 minutes
    isRunning: false,
    initialTime: 10 * 60,
  });

  // Task Input State
  const [currentTask, setCurrentTask] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(true);

  // Reflection State
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState<ReflectionData>({
    result: '',
    distractions: '',
    thoughts: '',
  });

  // Timer Management
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [timerEndTime, setTimerEndTime] = useState<Date | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveTimeRef = useRef<Date | null>(null);

  // 모든 interval 정리 함수
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

  // Timer synchronization function (UI 업데이트 없이 시간만 보정)
  const syncTimer = useCallback(() => {
    if (!timerStartTime || !timerState.isRunning) return;

    const now = new Date();
    const elapsed = Math.floor((now.getTime() - timerStartTime.getTime()) / 1000);
    const remaining = Math.max(0, 10 * 60 - elapsed);

    // 동기화는 5초마다만 하되, 타이머 완료 시에만 상태 업데이트
    if (remaining <= 0) {
      // 타이머 완료 - 모든 interval 정리
      clearAllIntervals();
      setTimerEndTime(new Date(timerStartTime.getTime() + 10 * 60 * 1000));
      setShowReflection(true);
      playNotification(currentTask);
      setTimerState(prev => ({ ...prev, timeLeft: 0, isRunning: false }));
    }
    // 완료되지 않은 경우에는 UI는 1초 interval이 처리하도록 함
  }, [timerStartTime, timerState.isRunning, currentTask, playNotification, clearAllIntervals]);

  // Timer Logic
  const startTimer = useCallback(() => {
    if (!currentTask.trim()) return;

    const startTime = new Date();
    setShowTaskInput(false);
    setTimerStartTime(startTime);
    lastActiveTimeRef.current = startTime;
    setTimerState(prev => ({ ...prev, isRunning: true }));

    // UI 업데이트용 interval (1초마다)
    const uiInterval = setInterval(() => {
      setTimerState(prev => {
        if (prev.timeLeft <= 1) {
          // 타이머 완료 - 모든 interval 정리
          clearAllIntervals();
          setTimerEndTime(new Date(startTime.getTime() + 10 * 60 * 1000));
          setShowReflection(true);
          playNotification(currentTask);
          return { ...prev, timeLeft: 0, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    timerIntervalRef.current = uiInterval;
  }, [currentTask, playNotification, clearAllIntervals]);

  const pauseTimer = useCallback(() => {
    clearAllIntervals();
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, [clearAllIntervals]);

  const stopTimer = useCallback(() => {
    pauseTimer();
    
    // 종료 시간 설정: 시작 시간 + 10분 또는 현재 시간 중 더 빠른 시간
    const startTime = timerStartTime || new Date();
    const expectedEndTime = new Date(startTime.getTime() + 10 * 60 * 1000); // 시작 시간 + 10분
    const currentTime = new Date();
    
    // 현재 시간이 예상 종료 시간보다 빠르면 현재 시간, 아니면 예상 종료 시간
    const endTime = currentTime < expectedEndTime ? currentTime : expectedEndTime;
    
    setTimerEndTime(endTime);
    setShowReflection(true);
  }, [pauseTimer, timerStartTime]);

  const resetTimer = useCallback(() => {
    clearAllIntervals();
    setTimerState({
      timeLeft: 10 * 60,
      isRunning: false,
      initialTime: 10 * 60,
    });
    setCurrentTask('');
    setShowTaskInput(true);
    setShowReflection(false);
    setReflection({ result: '', distractions: '', thoughts: '' });
    setTimerStartTime(null);
    setTimerEndTime(null);
  }, [clearAllIntervals]);

  const saveReflection = useCallback(async () => {
    const startTime = timerStartTime || new Date();
    let endTime = timerEndTime;
    
    // 종료 시간이 설정되지 않았다면 정확한 종료 시간 계산
    if (!endTime) {
      const expectedEndTime = new Date(startTime.getTime() + 10 * 60 * 1000);
      const currentTime = new Date();
      endTime = currentTime < expectedEndTime ? currentTime : expectedEndTime;
    }
    
    const actualTimeSpent = Math.max(0, 10 * 60 - timerState.timeLeft);

    const newCycle = {
      id: Date.now().toString(),
      date: selectedDate, // 선택된 날짜 사용
      task: currentTask,
      startTime: startTime.toISOString(), // ISO 문자열로 저장
      endTime: endTime.toISOString(), // ISO 문자열로 저장
      timeSpent: actualTimeSpent,
      result: reflection.result,
      distractions: reflection.distractions,
      thoughts: reflection.thoughts,
    };

    // Save using hybrid storage
    try {
      await hybridStorage.saveFocusCycle(newCycle);
    } catch (error) {
      console.error('포커스 사이클 저장 실패:', error);
    }

    // Update cycle history state
    if (addCycle) {
      addCycle(newCycle);
    }

    // Dispatch custom event for DateNavigation to update
    window.dispatchEvent(new CustomEvent('cycleAdded', { detail: newCycle }));

    resetTimer();
  }, [timerStartTime, timerEndTime, timerState.timeLeft, currentTask, reflection, resetTimer, addCycle, selectedDate]);

  const updateReflection = useCallback((field: keyof ReflectionData, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  }, []);

  // Format timer display
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Page Visibility API를 사용한 타이머 동기화
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerState.isRunning) {
        // 탭이 다시 활성화되면 타이머 동기화
        console.log('Tab became active, syncing timer...');
        syncTimer();
      } else if (document.visibilityState === 'hidden') {
        // 탭이 비활성화되면 현재 시간 기록
        lastActiveTimeRef.current = new Date();
      }
    };

    // 페이지 포커스/블러 이벤트도 처리
    const handleFocus = () => {
      if (timerState.isRunning) {
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

    // 정기적인 동기화 (5초마다) - UI 업데이트와 분리
    const syncInterval = setInterval(() => {
      if (timerState.isRunning && document.visibilityState === 'visible') {
        syncTimer();
      }
    }, 5000);
    
    syncIntervalRef.current = syncInterval;

    return () => {
      // 이벤트 리스너 정리
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      // 모든 interval 정리
      clearAllIntervals();
    };
  }, [timerState.isRunning, syncTimer, clearAllIntervals]);

  return {
    // State
    timerState,
    currentTask,
    showTaskInput,
    showReflection,
    reflection,
    timerStartTime,
    timerEndTime,

    // Actions
    setCurrentTask,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    saveReflection,
    updateReflection,

    // Utility
    formatTime,
  };
};
