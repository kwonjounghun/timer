/**
 * 세션 내보내기 훅
 * 타이머 세션 → 마크다운 다운로드 워크플로우 조율
 */

import { useState, useCallback } from 'react';
import { TimerSession } from '../../../new-timer/domain/types';
import {
  groupSessionsByTask,
  filterSessionsByDate,
} from '../../domain/session-aggregator';
import { formatSessionsToMarkdown } from '../../domain/markdown-formatter';
import { downloadMarkdownFile } from '../../infrastructure/file-downloader';

/**
 * 세션 내보내기 훅 반환 타입
 */
export interface UseSessionExportReturn {
  /**
   * 마크다운 파일로 내보내기
   * @param sessions 타이머 세션 배열
   * @param date 날짜 (YYYY-MM-DD)
   */
  exportAsMarkdown: (sessions: TimerSession[], date: string) => Promise<void>;

  /**
   * 내보내기 중 여부
   */
  isExporting: boolean;

  /**
   * 에러 메시지
   */
  error: string | null;
}

/**
 * 세션 내보내기 훅
 * @returns 세션 내보내기 관련 상태 및 함수
 */
export function useSessionExport(): UseSessionExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAsMarkdown = useCallback(
    async (sessions: TimerSession[], date: string) => {
      try {
        setIsExporting(true);
        setError(null);

        // 1. 타이머 세션 조회 (날짜 필터링)
        const dateSessions = filterSessionsByDate(sessions, date);

        if (dateSessions.length === 0) {
          throw new Error('해당 날짜에 세션이 없습니다.');
        }

        // 2. 마크다운 형태로 데이터 가공
        const sessionGroups = groupSessionsByTask(dateSessions);
        const markdownContent = formatSessionsToMarkdown(
          dateSessions,
          date,
          sessionGroups,
        );

        // 3. 마크다운 파일 다운로드
        downloadMarkdownFile(markdownContent.markdown, date);

        console.log('마크다운 다운로드 성공:', date);
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        setError(message);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return {
    exportAsMarkdown,
    isExporting,
    error,
  };
}
