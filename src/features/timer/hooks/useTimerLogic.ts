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

  // Timer Logic
  const startTimer = useCallback(() => {
    if (!currentTask.trim()) return;

    setShowTaskInput(false);
    setTimerStartTime(new Date());
    setTimerState(prev => ({ ...prev, isRunning: true }));

    const interval = setInterval(() => {
      setTimerState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          setTimerEndTime(new Date());
          setShowReflection(true);
          playNotification(currentTask);
          return { ...prev, timeLeft: 0, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    timerIntervalRef.current = interval;
  }, [currentTask, playNotification]);

  const pauseTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const stopTimer = useCallback(() => {
    pauseTimer();
    setTimerEndTime(new Date());
    setShowReflection(true);
  }, [pauseTimer]);

  const resetTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
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
  }, []);

  const saveReflection = useCallback(async () => {
    const startTime = timerStartTime || new Date();
    const endTime = timerEndTime || new Date();
    const actualTimeSpent = Math.max(0, 10 * 60 - timerState.timeLeft);

    const newCycle = {
      id: Date.now().toString(),
      date: selectedDate, // 선택된 날짜 사용
      task: currentTask,
      startTime,
      endTime,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

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
