/**
 * 세션 관리 로직
 * 순수 함수로만 구성된 세션 관련 비즈니스 로직
 */

import {
  TimerSession,
  SessionFilter,
  SessionSort,
  SessionStats,
  DailyStats,
  ReflectionData,
} from './types';

/**
 * 고유 ID 생성
 * @returns 고유 ID 문자열
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 세션 생성
 * @param task 작업명
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 * @param reflection 회고 데이터
 * @param date 날짜 (YYYY-MM-DD)
 * @returns 생성된 세션
 */
export function createSession(
  task: string,
  startTime: Date,
  endTime: Date,
  reflection: ReflectionData,
  date: string,
): TimerSession {
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  return {
    id: generateId(),
    task,
    startTime,
    endTime,
    duration,
    result: reflection.result,
    distractions: reflection.distractions,
    thoughts: reflection.thoughts,
    date,
  };
}

/**
 * 세션 업데이트 (불변성 유지)
 * @param session 기존 세션
 * @param updates 업데이트할 필드들
 * @returns 업데이트된 세션
 */
export function updateSession(
  session: TimerSession,
  updates: Partial<Omit<TimerSession, 'id'>>,
): TimerSession {
  const updatedSession = { ...session, ...updates };

  // 시간이 변경된 경우 duration 재계산
  if (updates.startTime || updates.endTime) {
    const startTime = updates.startTime || session.startTime;
    const endTime = updates.endTime || session.endTime;
    updatedSession.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  }

  return updatedSession;
}

/**
 * 세션 배열에서 특정 세션 업데이트
 * @param sessions 세션 배열
 * @param id 업데이트할 세션 ID
 * @param updates 업데이트할 필드들
 * @returns 업데이트된 세션 배열
 */
export function updateSessionInArray(
  sessions: TimerSession[],
  id: string,
  updates: Partial<Omit<TimerSession, 'id'>>,
): TimerSession[] {
  return sessions.map((session) => (session.id === id ? updateSession(session, updates) : session));
}

/**
 * 세션 배열에서 특정 세션 삭제
 * @param sessions 세션 배열
 * @param id 삭제할 세션 ID
 * @returns 삭제된 세션 배열
 */
export function removeSessionFromArray(sessions: TimerSession[], id: string): TimerSession[] {
  return sessions.filter((session) => session.id !== id);
}

/**
 * 날짜별 세션 필터링
 * @param sessions 세션 배열
 * @param date 필터링할 날짜 (YYYY-MM-DD)
 * @returns 필터링된 세션 배열
 */
export function filterSessionsByDate(sessions: TimerSession[], date: string): TimerSession[] {
  return sessions.filter((session) => session.date === date);
}

/**
 * 날짜 범위별 세션 필터링
 * @param sessions 세션 배열
 * @param startDate 시작 날짜 (YYYY-MM-DD)
 * @param endDate 종료 날짜 (YYYY-MM-DD)
 * @returns 필터링된 세션 배열
 */
export function filterSessionsByDateRange(
  sessions: TimerSession[],
  startDate: string,
  endDate: string,
): TimerSession[] {
  return sessions.filter((session) => session.date >= startDate && session.date <= endDate);
}

/**
 * 세션 필터링
 * @param sessions 세션 배열
 * @param filter 필터 옵션
 * @returns 필터링된 세션 배열
 */
export function filterSessions(sessions: TimerSession[], filter: SessionFilter): TimerSession[] {
  let filtered = [...sessions];

  if (filter.date) {
    filtered = filterSessionsByDate(filtered, filter.date);
  }

  if (filter.dateRange) {
    filtered = filterSessionsByDateRange(filtered, filter.dateRange.start, filter.dateRange.end);
  }

  return filtered;
}

/**
 * 시작 시간으로 세션 정렬
 * @param sessions 세션 배열
 * @param direction 정렬 방향
 * @returns 정렬된 세션 배열
 */
export function sortSessionsByStartTime(
  sessions: TimerSession[],
  direction: 'asc' | 'desc' = 'asc',
): TimerSession[] {
  return [...sessions].sort((a, b) => {
    const aTime = a.startTime.getTime();
    const bTime = b.startTime.getTime();

    return direction === 'asc' ? aTime - bTime : bTime - aTime;
  });
}

/**
 * 종료 시간으로 세션 정렬
 * @param sessions 세션 배열
 * @param direction 정렬 방향
 * @returns 정렬된 세션 배열
 */
export function sortSessionsByEndTime(
  sessions: TimerSession[],
  direction: 'asc' | 'desc' = 'asc',
): TimerSession[] {
  return [...sessions].sort((a, b) => {
    const aTime = a.endTime.getTime();
    const bTime = b.endTime.getTime();

    return direction === 'asc' ? aTime - bTime : bTime - aTime;
  });
}

/**
 * 소요 시간으로 세션 정렬
 * @param sessions 세션 배열
 * @param direction 정렬 방향
 * @returns 정렬된 세션 배열
 */
export function sortSessionsByDuration(
  sessions: TimerSession[],
  direction: 'asc' | 'desc' = 'desc',
): TimerSession[] {
  return [...sessions].sort((a, b) => {
    return direction === 'asc' ? a.duration - b.duration : b.duration - a.duration;
  });
}

/**
 * 세션 정렬
 * @param sessions 세션 배열
 * @param sort 정렬 옵션
 * @returns 정렬된 세션 배열
 */
export function sortSessions(sessions: TimerSession[], sort: SessionSort): TimerSession[] {
  switch (sort.field) {
    case 'startTime':
      return sortSessionsByStartTime(sessions, sort.direction);
    case 'endTime':
      return sortSessionsByEndTime(sessions, sort.direction);
    case 'duration':
      return sortSessionsByDuration(sessions, sort.direction);
    default:
      return sessions;
  }
}

/**
 * 세션 필터링 및 정렬
 * @param sessions 세션 배열
 * @param filter 필터 옵션
 * @param sort 정렬 옵션
 * @returns 처리된 세션 배열
 */
export function processSessions(
  sessions: TimerSession[],
  filter?: SessionFilter,
  sort?: SessionSort,
): TimerSession[] {
  let processed = [...sessions];

  if (filter) {
    processed = filterSessions(processed, filter);
  }

  if (sort) {
    processed = sortSessions(processed, sort);
  }

  return processed;
}

/**
 * 세션 통계 계산
 * @param sessions 세션 배열
 * @returns 세션 통계
 */
export function calculateSessionStats(sessions: TimerSession[]): SessionStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalTime: 0,
      averageTime: 0,
      longestSession: null,
      shortestSession: null,
    };
  }

  const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
  const averageTime = totalTime / sessions.length;

  const longestSession = sessions.reduce((longest, current) =>
    current.duration > longest.duration ? current : longest,
  );

  const shortestSession = sessions.reduce((shortest, current) =>
    current.duration < shortest.duration ? current : shortest,
  );

  return {
    totalSessions: sessions.length,
    totalTime,
    averageTime,
    longestSession,
    shortestSession,
  };
}

/**
 * 날짜별 통계 계산
 * @param sessions 세션 배열
 * @param date 날짜 (YYYY-MM-DD)
 * @returns 해당 날짜의 통계
 */
export function calculateDailyStats(sessions: TimerSession[], date: string): DailyStats {
  const dailySessions = filterSessionsByDate(sessions, date);

  if (dailySessions.length === 0) {
    return {
      date,
      sessionCount: 0,
      totalTime: 0,
      averageTime: 0,
      firstSessionTime: null,
      lastSessionTime: null,
    };
  }

  const totalTime = dailySessions.reduce((sum, session) => sum + session.duration, 0);
  const averageTime = totalTime / dailySessions.length;

  const sortedByStartTime = sortSessionsByStartTime(dailySessions, 'asc');
  const firstSession = sortedByStartTime[0];
  const lastSession = sortedByStartTime[sortedByStartTime.length - 1];

  return {
    date,
    sessionCount: dailySessions.length,
    totalTime,
    averageTime,
    firstSessionTime: firstSession ? firstSession.startTime.toLocaleTimeString('ko-KR') : null,
    lastSessionTime: lastSession ? lastSession.endTime.toLocaleTimeString('ko-KR') : null,
  };
}

/**
 * 세션 검색
 * @param sessions 세션 배열
 * @param query 검색 쿼리
 * @returns 검색된 세션 배열
 */
export function searchSessions(sessions: TimerSession[], query: string): TimerSession[] {
  if (!query.trim()) return sessions;

  const lowercaseQuery = query.toLowerCase();

  return sessions.filter(
    (session) =>
      session.task.toLowerCase().includes(lowercaseQuery) ||
      session.result.toLowerCase().includes(lowercaseQuery) ||
      session.distractions.toLowerCase().includes(lowercaseQuery) ||
      session.thoughts.toLowerCase().includes(lowercaseQuery),
  );
}

/**
 * 세션 유효성 검사
 * @param session 검사할 세션
 * @returns 유효성 검사 결과
 */
export function validateSession(session: TimerSession): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!session.id) {
    errors.push('세션 ID가 필요합니다.');
  }

  if (!session.task.trim()) {
    errors.push('작업명이 필요합니다.');
  }

  if (!session.startTime || isNaN(session.startTime.getTime())) {
    errors.push('유효한 시작 시간이 필요합니다.');
  }

  if (!session.endTime || isNaN(session.endTime.getTime())) {
    errors.push('유효한 종료 시간이 필요합니다.');
  }

  if (session.duration < 0) {
    errors.push('소요 시간은 음수가 될 수 없습니다.');
  }

  if (session.startTime && session.endTime) {
    const start = session.startTime;
    const end = session.endTime;

    if (start >= end) {
      errors.push('시작 시간은 종료 시간보다 빨라야 합니다.');
    }
  }

  if (!session.date || !/^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
    errors.push('유효한 날짜 형식이 필요합니다. (YYYY-MM-DD)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
