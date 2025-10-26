/**
 * Repository 인터페이스 정의
 * 의존성 역전 원칙(DIP)을 위한 인터페이스
 */

import { TimerSession, SessionFilter, SessionSort, SessionStats, DailyStats } from './types';

/**
 * 세션 저장소 인터페이스
 */
export interface ISessionRepository {
  /**
   * 세션 저장
   * @param session 저장할 세션
   * @returns 생성된 세션 ID
   */
  saveSession(session: TimerSession): Promise<string>;

  /**
   * 특정 날짜의 세션들 조회
   * @param date YYYY-MM-DD 형식의 날짜
   * @returns 해당 날짜의 세션 배열
   */
  getSessionsByDate(date: string): Promise<TimerSession[]>;

  /**
   * 모든 세션 조회
   * @param limit 최대 개수 (선택사항)
   * @returns 세션 배열
   */
  getAllSessions(limit?: number): Promise<TimerSession[]>;

  /**
   * 세션 업데이트
   * @param id 세션 ID
   * @param updates 업데이트할 필드들
   */
  updateSession(id: string, updates: Partial<TimerSession>): Promise<void>;

  /**
   * 세션 삭제
   * @param id 세션 ID
   */
  deleteSession(id: string): Promise<void>;

  /**
   * 세션 필터링 및 정렬
   * @param filter 필터 옵션
   * @param sort 정렬 옵션
   * @returns 처리된 세션 배열
   */
  getSessions(filter?: SessionFilter, sort?: SessionSort): Promise<TimerSession[]>;

  /**
   * 세션 통계 조회
   * @param filter 필터 옵션
   * @returns 세션 통계
   */
  getSessionStats(filter?: SessionFilter): Promise<SessionStats>;

  /**
   * 날짜별 통계 조회
   * @param date YYYY-MM-DD 형식의 날짜
   * @returns 해당 날짜의 통계
   */
  getDailyStats(date: string): Promise<DailyStats>;
}

/**
 * 알림 서비스 인터페이스
 */
export interface INotificationService {
  /**
   * 알림 권한 요청
   * @returns 권한 허용 여부
   */
  requestPermission(): Promise<boolean>;

  /**
   * 알림 표시
   * @param title 알림 제목
   * @param body 알림 내용 (선택사항)
   */
  showNotification(title: string, body?: string): Promise<void>;

  /**
   * 알림 지원 여부 확인
   * @returns 지원 여부
   */
  isSupported(): boolean;

  /**
   * 현재 권한 상태 조회
   * @returns 권한 상태
   */
  getPermissionStatus(): string;

  /**
   * 타이머 완료 알림 표시
   * @param taskName 작업명 (선택사항)
   */
  showTimerCompletionNotification(taskName?: string): Promise<void>;
}
