/**
 * 타이머 상태 정의
 */
export type TimerStatus = 'IDLE' | 'TASK_INPUT' | 'RUNNING' | 'PAUSED' | 'REFLECTION';

/**
 * 타이머 상태 데이터
 */
export interface TimerState {
  status: TimerStatus;
  timeLeft: number; // 초 단위
  initialTime: number; // 초 단위
  startTime: Date | null;
  endTime: Date | null;
  lastActiveTime: Date | null;
}

/**
 * 회고 데이터
 */
export interface ReflectionData {
  result: string;
  distractions: string;
  thoughts: string;
}

/**
 * 포커스 사이클 데이터
 */
export interface FocusCycle {
  id: string;
  date: string;
  task: string;
  startTime: Date;
  endTime: Date;
  timeSpent: number; // 초 단위
  result: string;
  distractions: string;
  thoughts: string;
}

/**
 * 타이머 액션 타입
 */
export type TimerAction = 
  | { type: 'SET_TASK'; payload: string }
  | { type: 'START_TIMER'; payload?: Date }
  | { type: 'PAUSE_TIMER' }
  | { type: 'STOP_TIMER'; payload?: Date }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK'; payload: Date }
  | { type: 'SYNC'; payload: Date }
  | { type: 'UPDATE_REFLECTION'; payload: Partial<ReflectionData> }
  | { type: 'SAVE_REFLECTION' };

/**
 * 타이머 컨텍스트 (외부 의존성)
 */
export interface TimerContext {
  currentDate: string;
  onCycleComplete?: (cycle: FocusCycle) => void;
}

/**
 * 타이머 계산 결과
 */
export interface TimerCalculation {
  timeLeft: number;
  elapsed: number;
  isComplete: boolean;
  formattedTime: string;
}

/**
 * 사이클 정렬 옵션
 */
export interface CycleSortOptions {
  field: 'startTime' | 'endTime' | 'timeSpent';
  direction: 'asc' | 'desc';
}

/**
 * 사이클 필터 옵션
 */
export interface CycleFilterOptions {
  date?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * 알림 권한 상태
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * 알림 서비스 인터페이스
 */
export interface NotificationService {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission(): Promise<NotificationPermission>;
  showNotification(taskName?: string): Promise<void>;
}

/**
 * Firebase Repository 인터페이스
 */
export interface FocusCycleRepository {
  saveCycle(cycle: FocusCycle): Promise<string>;
  getCyclesByDate(date: string): Promise<FocusCycle[]>;
  getAllCycles(limit?: number): Promise<FocusCycle[]>;
  updateCycle(id: string, updates: Partial<FocusCycle>): Promise<void>;
  deleteCycle(id: string): Promise<void>;
}
