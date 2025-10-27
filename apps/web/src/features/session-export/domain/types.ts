/**
 * 세션 내보내기 도메인 타입 정의
 */

import { TimerSession } from '../../new-timer/domain/types';

/**
 * 마크다운 콘텐츠
 */
export interface MarkdownContent {
  title: string;
  date: string;
  markdown: string;
  sessionCount: number;
  totalDuration: number;
}

/**
 * 세션 그룹 (작업별로 묶인 세션들)
 */
export interface SessionGroup {
  task: string;
  sessions: TimerSession[];
  totalDuration: number;
  count: number;
}
