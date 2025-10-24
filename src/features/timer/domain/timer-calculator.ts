import { TimerState, TimerCalculation } from './types';

/**
 * 타이머 시간 계산 순수 함수들
 */

/**
 * 남은 시간 계산
 * @param startTime 시작 시간
 * @param currentTime 현재 시간
 * @param initialTime 초기 시간 (초)
 * @returns 남은 시간 (초)
 */
export function calculateTimeLeft(
  startTime: Date | null,
  currentTime: Date,
  initialTime: number
): number {
  if (!startTime) return initialTime;
  
  const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
  return Math.max(0, initialTime - elapsed);
}

/**
 * 경과 시간 계산
 * @param startTime 시작 시간
 * @param currentTime 현재 시간
 * @returns 경과 시간 (초)
 */
export function calculateElapsedTime(startTime: Date | null, currentTime: Date): number {
  if (!startTime) return 0;
  
  return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * 시간을 MM:SS 형식으로 포맷팅
 * @param seconds 초 단위 시간
 * @returns 포맷된 시간 문자열 (MM:SS)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 타이머 완료 여부 확인
 * @param timeLeft 남은 시간
 * @returns 완료 여부
 */
export function isTimerComplete(timeLeft: number): boolean {
  return timeLeft <= 0;
}

/**
 * 종료 시간 계산
 * @param startTime 시작 시간
 * @param currentTime 현재 시간
 * @param initialTime 초기 시간 (초)
 * @returns 종료 시간
 */
export function calculateEndTime(
  startTime: Date | null,
  currentTime: Date,
  initialTime: number
): Date {
  if (!startTime) return currentTime;
  
  const expectedEndTime = new Date(startTime.getTime() + initialTime * 1000);
  return currentTime < expectedEndTime ? currentTime : expectedEndTime;
}

/**
 * 실제 소요 시간 계산
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @param initialTime 초기 시간 (초)
 * @returns 실제 소요 시간 (초)
 */
export function calculateActualTimeSpent(
  startTime: Date | null,
  endTime: Date | null,
  initialTime: number
): number {
  if (!startTime || !endTime) return 0;
  
  const actualElapsed = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  return Math.min(actualElapsed, initialTime);
}

/**
 * 타이머 동기화를 위한 계산
 * @param timerState 현재 타이머 상태
 * @param currentTime 현재 시간
 * @returns 동기화된 타이머 계산 결과
 */
export function syncTimerCalculation(
  timerState: TimerState,
  currentTime: Date
): TimerCalculation {
  const timeLeft = calculateTimeLeft(timerState.startTime, currentTime, timerState.initialTime);
  const elapsed = calculateElapsedTime(timerState.startTime, currentTime);
  const isComplete = isTimerComplete(timeLeft);
  
  return {
    timeLeft,
    elapsed,
    isComplete,
    formattedTime: formatTime(timeLeft)
  };
}

/**
 * 타이머 상태 업데이트를 위한 계산
 * @param timerState 현재 타이머 상태
 * @param currentTime 현재 시간
 * @returns 업데이트된 타이머 상태
 */
export function updateTimerState(
  timerState: TimerState,
  currentTime: Date
): TimerState {
  const calculation = syncTimerCalculation(timerState, currentTime);
  
  return {
    ...timerState,
    timeLeft: calculation.timeLeft,
    lastActiveTime: currentTime
  };
}

/**
 * 타이머 리셋
 * @param initialTime 초기 시간 (초)
 * @returns 리셋된 타이머 상태
 */
export function resetTimerState(initialTime: number = 10 * 60): TimerState {
  return {
    status: 'IDLE',
    timeLeft: initialTime,
    initialTime,
    startTime: null,
    endTime: null,
    lastActiveTime: null
  };
}

/**
 * 타이머 시작 상태로 전환
 * @param timerState 현재 타이머 상태
 * @param startTime 시작 시간
 * @returns 시작된 타이머 상태
 */
export function startTimerState(timerState: TimerState, startTime: Date): TimerState {
  return {
    ...timerState,
    status: 'RUNNING',
    startTime,
    lastActiveTime: startTime
  };
}

/**
 * 타이머 일시정지 상태로 전환
 * @param timerState 현재 타이머 상태
 * @returns 일시정지된 타이머 상태
 */
export function pauseTimerState(timerState: TimerState): TimerState {
  return {
    ...timerState,
    status: 'PAUSED'
  };
}

/**
 * 타이머 중단 상태로 전환
 * @param timerState 현재 타이머 상태
 * @param endTime 종료 시간
 * @returns 중단된 타이머 상태
 */
export function stopTimerState(timerState: TimerState, endTime: Date): TimerState {
  return {
    ...timerState,
    status: 'REFLECTION',
    endTime
  };
}
