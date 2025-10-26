/**
 * 타이머 계산 로직
 * 순수 함수로만 구성된 시간 관련 비즈니스 로직
 */

import { TimerState, TimerStatus, TimerCalculation } from './types';

/**
 * 초를 MM:SS 형식으로 포맷팅
 * @param seconds 초 단위 시간
 * @returns MM:SS 형식 문자열
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 초를 HH:MM:SS 형식으로 포맷팅
 * @param seconds 초 단위 시간
 * @returns HH:MM:SS 형식 문자열
 */
export function formatTimeLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

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
  const timeLeft = Math.max(0, initialTime - elapsed);
  
  return timeLeft;
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
 * 진행률 계산 (0-100)
 * @param elapsed 경과 시간 (초)
 * @param total 총 시간 (초)
 * @returns 진행률 (0-100)
 */
export function calculateProgress(elapsed: number, total: number): number {
  if (total <= 0) return 0;
  
  const progress = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * 타이머 완료 여부 확인
 * @param timeLeft 남은 시간 (초)
 * @returns 완료 여부
 */
export function isTimerComplete(timeLeft: number): boolean {
  return timeLeft <= 0;
}

/**
 * 타이머 상태 검증
 * @param state 타이머 상태
 * @returns 유효성 검사 결과
 */
export function validateTimerState(state: TimerState): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (state.timeLeft < 0) {
    errors.push('남은 시간은 음수가 될 수 없습니다.');
  }
  
  if (state.timeLeft > state.initialTime) {
    errors.push('남은 시간은 초기 시간보다 클 수 없습니다.');
  }
  
  if (state.status === 'RUNNING' && !state.startTime) {
    errors.push('실행 중인 타이머는 시작 시간이 있어야 합니다.');
  }
  
  if (state.status === 'COMPLETED' && state.timeLeft > 0) {
    errors.push('완료된 타이머는 남은 시간이 0이어야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 타이머 계산 수행
 * @param state 현재 타이머 상태
 * @param currentTime 현재 시간
 * @returns 계산 결과
 */
export function calculateTimer(state: TimerState, currentTime: Date): TimerCalculation {
  const timeLeft = calculateTimeLeft(state.startTime, currentTime, state.initialTime);
  const elapsed = calculateElapsedTime(state.startTime, currentTime);
  const progress = calculateProgress(elapsed, state.initialTime);
  const isComplete = isTimerComplete(timeLeft);
  
  return {
    timeLeft,
    elapsed,
    progress,
    isComplete,
    formattedTime: formatTime(timeLeft)
  };
}

/**
 * 타이머 상태 생성
 * @param initialTime 초기 시간 (초)
 * @param task 작업명
 * @returns 초기 타이머 상태
 */
export function createInitialTimerState(initialTime: number = 600, task: string = ''): TimerState {
  return {
    status: 'IDLE',
    timeLeft: initialTime,
    initialTime,
    startTime: null,
    task
  };
}

/**
 * 타이머 시작
 * @param state 현재 상태
 * @param startTime 시작 시간
 * @returns 새로운 상태
 */
export function startTimer(state: TimerState, startTime: Date): TimerState {
  if (state.status !== 'IDLE' && state.status !== 'PAUSED') {
    return state;
  }
  
  return {
    ...state,
    status: 'RUNNING',
    startTime,
    timeLeft: state.status === 'PAUSED' ? state.timeLeft : state.initialTime
  };
}

/**
 * 타이머 일시정지
 * @param state 현재 상태
 * @param currentTime 현재 시간
 * @returns 새로운 상태
 */
export function pauseTimer(state: TimerState, currentTime: Date): TimerState {
  if (state.status !== 'RUNNING') {
    return state;
  }
  
  const timeLeft = calculateTimeLeft(state.startTime, currentTime, state.initialTime);
  
  return {
    ...state,
    status: 'PAUSED',
    timeLeft
  };
}

/**
 * 타이머 재개
 * @param state 현재 상태
 * @param startTime 재개 시간
 * @returns 새로운 상태
 */
export function resumeTimer(state: TimerState, startTime: Date): TimerState {
  if (state.status !== 'PAUSED') {
    return state;
  }
  
  return {
    ...state,
    status: 'RUNNING',
    startTime
  };
}

/**
 * 타이머 중단
 * @param state 현재 상태
 * @param currentTime 현재 시간
 * @returns 새로운 상태
 */
export function stopTimer(state: TimerState, currentTime: Date): TimerState {
  if (state.status !== 'RUNNING' && state.status !== 'PAUSED') {
    return state;
  }
  
  return {
    ...state,
    status: 'COMPLETED',
    timeLeft: 0
  };
}

/**
 * 타이머 리셋
 * @param state 현재 상태
 * @returns 새로운 상태
 */
export function resetTimer(state: TimerState): TimerState {
  return {
    ...state,
    status: 'IDLE',
    timeLeft: state.initialTime,
    startTime: null,
    task: ''
  };
}

/**
 * 타이머 완료 처리
 * @param state 현재 상태
 * @param currentTime 현재 시간
 * @returns 새로운 상태
 */
export function completeTimer(state: TimerState, currentTime: Date): TimerState {
  if (state.status !== 'RUNNING') {
    return state;
  }
  
  return {
    ...state,
    status: 'COMPLETED',
    timeLeft: 0
  };
}

/**
 * 타이머 상태 동기화 (탭 전환 등)
 * @param state 현재 상태
 * @param currentTime 현재 시간
 * @param lastActiveTime 마지막 활성 시간
 * @returns 동기화된 상태
 */
export function syncTimerState(
  state: TimerState,
  currentTime: Date,
  lastActiveTime?: Date | null
): TimerState {
  if (state.status !== 'RUNNING') {
    return state;
  }
  
  // 마지막 활성 시간이 있고, 현재 시간과 차이가 크면 동기화
  if (lastActiveTime) {
    const timeDiff = Math.abs(currentTime.getTime() - lastActiveTime.getTime());
    const maxDiff = 5 * 60 * 1000; // 5분
    
    if (timeDiff > maxDiff) {
      // 시간 차이가 크면 동기화
      const timeLeft = calculateTimeLeft(state.startTime, currentTime, state.initialTime);
      
      if (timeLeft <= 0) {
        return completeTimer(state, currentTime);
      }
      
      return {
        ...state,
        timeLeft
      };
    }
  }
  
  // 일반적인 동기화
  const timeLeft = calculateTimeLeft(state.startTime, currentTime, state.initialTime);
  
  if (timeLeft <= 0) {
    return completeTimer(state, currentTime);
  }
  
  return {
    ...state,
    timeLeft
  };
}
