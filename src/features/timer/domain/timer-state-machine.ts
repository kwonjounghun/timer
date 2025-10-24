import { TimerState, TimerAction, ReflectionData, FocusCycle } from './types';
import { 
  calculateTimeLeft, 
  calculateEndTime, 
  calculateActualTimeSpent,
  isTimerComplete,
  resetTimerState,
  startTimerState,
  pauseTimerState,
  stopTimerState
} from './timer-calculator';

/**
 * 타이머 상태 머신 순수 함수들
 */

/**
 * 초기 타이머 상태 생성
 * @param initialTime 초기 시간 (초)
 * @returns 초기 타이머 상태
 */
export function createInitialTimerState(initialTime: number = 10 * 60): TimerState {
  return {
    status: 'TASK_INPUT',
    timeLeft: initialTime,
    initialTime,
    startTime: null,
    endTime: null,
    lastActiveTime: null
  };
}

/**
 * 타이머 상태 리듀서 (순수 함수)
 * @param state 현재 상태
 * @param action 액션
 * @returns 새로운 상태
 */
export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_TASK':
      // 작업 설정은 상태에 직접 저장하지 않고, 외부에서 관리
      return state;
      
    case 'START_TIMER':
      if (state.status === 'TASK_INPUT' || state.status === 'PAUSED') {
        const startTime = action.payload || new Date();
        return startTimerState(state, startTime);
      }
      return state;
      
    case 'PAUSE_TIMER':
      if (state.status === 'RUNNING') {
        return pauseTimerState(state);
      }
      return state;
      
    case 'STOP_TIMER':
      if (state.status === 'RUNNING' || state.status === 'PAUSED') {
        const endTime = action.payload || new Date();
        return stopTimerState(state, endTime);
      }
      return state;
      
    case 'RESET_TIMER':
      return resetTimerState(state.initialTime);
      
    case 'TICK':
      if (state.status === 'RUNNING') {
        const currentTime = action.payload;
        const timeLeft = calculateTimeLeft(state.startTime, currentTime, state.initialTime);
        
        if (isTimerComplete(timeLeft)) {
          // 타이머 완료
          const endTime = calculateEndTime(state.startTime, currentTime, state.initialTime);
          return {
            ...state,
            status: 'REFLECTION',
            timeLeft: 0,
            endTime,
            lastActiveTime: currentTime
          };
        } else {
          // 타이머 진행 중
          return {
            ...state,
            timeLeft,
            lastActiveTime: currentTime
          };
        }
      }
      return state;
      
    case 'SYNC':
      if (state.status === 'RUNNING') {
        const currentTime = action.payload;
        const timeLeft = calculateTimeLeft(state.startTime, currentTime, state.initialTime);
        
        if (isTimerComplete(timeLeft)) {
          // 타이머 완료
          const endTime = calculateEndTime(state.startTime, currentTime, state.initialTime);
          return {
            ...state,
            status: 'REFLECTION',
            timeLeft: 0,
            endTime,
            lastActiveTime: currentTime
          };
        } else {
          // 타이머 동기화
          return {
            ...state,
            timeLeft,
            lastActiveTime: currentTime
          };
        }
      }
      return state;
      
    case 'UPDATE_REFLECTION':
      // 회고 데이터는 외부에서 관리
      return state;
      
    case 'SAVE_REFLECTION':
      // 회고 저장 후 리셋
      return resetTimerState(state.initialTime);
      
    default:
      return state;
  }
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
  
  if (state.status === 'REFLECTION' && !state.endTime) {
    errors.push('회고 상태의 타이머는 종료 시간이 있어야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 타이머 상태에서 포커스 사이클 생성
 * @param state 타이머 상태
 * @param task 작업 내용
 * @param reflection 회고 데이터
 * @param date 날짜
 * @returns 포커스 사이클
 */
export function createFocusCycleFromState(
  state: TimerState,
  task: string,
  reflection: ReflectionData,
  date: string
): FocusCycle {
  const startTime = state.startTime || new Date();
  const endTime = state.endTime || new Date();
  const timeSpent = calculateActualTimeSpent(startTime, endTime, state.initialTime);
  
  return {
    id: Date.now().toString(),
    date,
    task,
    startTime,
    endTime,
    timeSpent,
    result: reflection.result,
    distractions: reflection.distractions,
    thoughts: reflection.thoughts
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
      return timerReducer(state, { type: 'SYNC', payload: currentTime });
    }
  }
  
  return timerReducer(state, { type: 'TICK', payload: currentTime });
}

/**
 * 타이머 상태에서 다음 가능한 액션들 반환
 * @param state 현재 상태
 * @returns 가능한 액션들
 */
export function getAvailableActions(state: TimerState): string[] {
  switch (state.status) {
    case 'TASK_INPUT':
      return ['START_TIMER'];
    case 'RUNNING':
      return ['PAUSE_TIMER', 'STOP_TIMER'];
    case 'PAUSED':
      return ['START_TIMER', 'STOP_TIMER', 'RESET_TIMER'];
    case 'REFLECTION':
      return ['SAVE_REFLECTION', 'RESET_TIMER'];
    case 'IDLE':
      return ['START_TIMER'];
    default:
      return [];
  }
}

/**
 * 타이머 상태가 특정 상태인지 확인
 * @param state 타이머 상태
 * @param status 확인할 상태
 * @returns 상태 일치 여부
 */
export function isTimerStatus(state: TimerState, status: TimerState['status']): boolean {
  return state.status === status;
}

/**
 * 타이머가 실행 중인지 확인
 * @param state 타이머 상태
 * @returns 실행 중 여부
 */
export function isTimerRunning(state: TimerState): boolean {
  return state.status === 'RUNNING';
}

/**
 * 타이머가 완료되었는지 확인
 * @param state 타이머 상태
 * @returns 완료 여부
 */
export function isTimerCompleted(state: TimerState): boolean {
  return state.status === 'REFLECTION' || (state.status === 'RUNNING' && state.timeLeft <= 0);
}
