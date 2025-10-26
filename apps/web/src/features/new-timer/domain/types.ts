/**
 * 10분 타이머 도메인 타입 정의
 * UI 독립적인 순수한 비즈니스 개념들
 */

/**
 * 타이머 상태
 */
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

/**
 * 타이머 상태 데이터
 */
export interface TimerState {
  status: TimerStatus;
  timeLeft: number; // 초 단위
  initialTime: number; // 초 단위 (기본 600초 = 10분)
  startTime: Date | null;
  task: string;
}

/**
 * 회고 데이터
 */
export interface ReflectionData {
  result: string;        // 이번 작업에서 이뤄낸 결과
  distractions: string;  // 작업을 방해한 요소들
  thoughts: string;      // 이번 10분에 대한 전체적인 회고
}

/**
 * 타이머 세션 데이터
 */
export interface TimerSession {
  id: string;
  task: string;
  startTime: Date;
  endTime: Date;
  duration: number; // 초 단위
  result: string;        // 이번 작업에서 이뤄낸 결과
  distractions: string;  // 작업을 방해한 요소들
  thoughts: string;      // 이번 10분에 대한 전체적인 회고
  date: string; // YYYY-MM-DD 형식
}

/**
 * 타이머 계산 결과
 */
export interface TimerCalculation {
  timeLeft: number;
  elapsed: number;
  progress: number; // 0-100
  isComplete: boolean;
  formattedTime: string;
}

/**
 * 세션 필터 옵션
 */
export interface SessionFilter {
  date?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * 세션 정렬 옵션
 */
export interface SessionSort {
  field: 'startTime' | 'endTime' | 'duration';
  direction: 'asc' | 'desc';
}

/**
 * 알림 권한 상태
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * 타이머 설정
 */
export interface TimerConfig {
  initialTime?: number; // 초 단위, 기본 600초
  autoStart?: boolean;
  showNotifications?: boolean;
}

/**
 * 세션 통계
 */
export interface SessionStats {
  totalSessions: number;
  totalTime: number; // 초 단위
  averageTime: number; // 초 단위
  longestSession: TimerSession | null;
  shortestSession: TimerSession | null;
}

/**
 * 날짜별 세션 통계
 */
export interface DailyStats {
  date: string;
  sessionCount: number;
  totalTime: number; // 초 단위
  averageTime: number; // 초 단위
  firstSessionTime: string | null;
  lastSessionTime: string | null;
}
