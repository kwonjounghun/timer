/**
 * 세션 집계 로직
 * es-toolkit을 활용한 선언적 데이터 처리
 */

import { groupBy, sumBy } from 'es-toolkit';
import { TimerSession } from '../../new-timer/domain/types';
import { SessionGroup } from './types';

/**
 * 세션들을 작업명으로 그룹화
 * @param sessions 타이머 세션 배열
 * @returns 작업별로 그룹화된 세션 목록
 */
export function groupSessionsByTask(sessions: TimerSession[]): SessionGroup[] {
  const grouped = groupBy(sessions, (session: TimerSession) => session.task);

  return Object.entries(grouped).map(([task, sessions]) => ({
    task,
    sessions: sessions as TimerSession[],
    totalDuration: sumBy(sessions as TimerSession[], (s: TimerSession) => s.duration),
    count: sessions.length,
  }));
}

/**
 * 총 작업 시간 계산
 * @param sessions 타이머 세션 배열
 * @returns 총 작업 시간 (초)
 */
export function calculateTotalDuration(sessions: TimerSession[]): number {
  return sumBy(sessions, (s: TimerSession) => s.duration);
}

/**
 * 날짜별 세션 필터링
 * @param sessions 타이머 세션 배열
 * @param date 필터링할 날짜 (YYYY-MM-DD)
 * @returns 해당 날짜의 세션 배열
 */
export function filterSessionsByDate(sessions: TimerSession[], date: string): TimerSession[] {
  return sessions.filter((session) => session.date === date);
}
