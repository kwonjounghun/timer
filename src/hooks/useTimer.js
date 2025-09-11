import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialTime = 10 * 60, onComplete = null) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const intervalRef = useRef(null);

  // 실제 경과 시간을 기반으로 남은 시간 계산
  const calculateTimeLeft = useCallback((start, paused) => {
    if (!start) return initialTime;

    const now = Date.now();
    const elapsed = Math.floor((now - start - paused) / 1000);
    const remaining = Math.max(0, initialTime - elapsed);

    return remaining;
  }, [initialTime]);

  // 타이머 업데이트 함수
  const updateTimer = useCallback(() => {
    if (!isRunning || !startTime) return;

    const remaining = calculateTimeLeft(startTime, pausedTime);
    setTimeLeft(remaining);

    // 타이머 완료 체크
    if (remaining <= 0) {
      setIsRunning(false);
      setTimeLeft(0);
      // 완료 콜백 호출
      if (onComplete) {
        onComplete();
      }
    }
  }, [isRunning, startTime, pausedTime, calculateTimeLeft, onComplete]);

  // 주기적으로 타이머 업데이트 (UI 갱신용)
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(updateTimer, 100); // 100ms마다 업데이트
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, updateTimer]);

  // 페이지 가시성 변경 감지 (탭 전환 시 정확한 시간 계산)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && startTime) {
        // 탭이 다시 활성화되면 즉시 시간 업데이트
        updateTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, startTime, updateTimer]);

  const startTimer = useCallback(() => {
    const now = Date.now();

    if (!startTime) {
      // 처음 시작
      setStartTime(now);
      setPausedTime(0);
    } else {
      // 재시작 (일시정지에서 복구)
      const pausedDuration = now - (startTime + pausedTime + (initialTime - timeLeft) * 1000);
      setPausedTime(prev => prev + pausedDuration);
    }

    setIsRunning(true);
  }, [startTime, pausedTime, timeLeft, initialTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setStartTime(null);
    setPausedTime(0);
  }, [initialTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    setTimeLeft
  };
};
