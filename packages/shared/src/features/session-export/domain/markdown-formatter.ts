/**
 * 마크다운 포매터
 * 세션 데이터를 마크다운 문서로 변환
 */

import { SessionGroup, MarkdownContent } from './types';
import { TimerSession } from '../../new-timer/domain/types';

/**
 * 초를 시간:분 형식으로 변환
 * @param seconds 초 단위 시간
 * @returns 포맷된 시간 문자열 (예: "2시간 30분")
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

/**
 * 세션 그룹을 마크다운 섹션으로 변환
 * @param group 세션 그룹
 * @returns 마크다운 형식의 문자열
 */
function formatSessionGroup(group: SessionGroup): string {
  const header = `## ${group.task}\n`;
  const summary = `**총 ${group.count}개 세션** | **${formatDuration(group.totalDuration)}**\n\n`;

  const sessions = group.sessions
    .map((session, index) => {
      const time = new Date(session.startTime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return [
        `### 세션 ${index + 1} (${time})`,
        session.result && `**결과**: ${session.result}`,
        session.distractions && `**방해요소**: ${session.distractions}`,
        session.thoughts && `**회고**: ${session.thoughts}`,
        '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n---\n\n');

  return header + summary + sessions;
}

/**
 * 타이머 세션들을 마크다운 콘텐츠로 변환
 * @param sessions 전체 세션 배열
 * @param date 날짜 (YYYY-MM-DD)
 * @param sessionGroups 그룹화된 세션 목록
 * @returns 마크다운 콘텐츠
 */
export function formatSessionsToMarkdown(
  sessions: TimerSession[],
  date: string,
  sessionGroups: SessionGroup[],
): MarkdownContent {
  const totalDuration = sessionGroups.reduce((sum, group) => sum + group.totalDuration, 0);
  const sessionCount = sessions.length;

  const title = `타이머 세션 - ${date}`;

  const markdown = [
    `# ${title}\n`,
    `**총 세션**: ${sessionCount}개`,
    `**총 작업 시간**: ${formatDuration(totalDuration)}\n`,
    '---\n',
    ...sessionGroups.map(formatSessionGroup),
  ].join('\n');

  return {
    title,
    date,
    markdown,
    sessionCount,
    totalDuration,
  };
}
