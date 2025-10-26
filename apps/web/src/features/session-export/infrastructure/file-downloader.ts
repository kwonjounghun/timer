/**
 * 파일 다운로드 유틸리티
 * 브라우저에서 텍스트 파일을 다운로드
 */

/**
 * 텍스트 파일 다운로드
 * @param content 파일 내용
 * @param filename 파일명
 * @param mimeType MIME 타입
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string = 'text/markdown;charset=utf-8',
): void {
  // Blob 생성
  const blob = new Blob([content], { type: mimeType });

  // URL 생성
  const url = URL.createObjectURL(blob);

  // 임시 링크 생성 및 클릭
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // 정리
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 마크다운 파일 다운로드
 * @param content 마크다운 내용
 * @param date 날짜 (파일명에 사용)
 */
export function downloadMarkdownFile(content: string, date: string): void {
  const filename = `timer-sessions-${date}.md`;
  downloadTextFile(content, filename, 'text/markdown;charset=utf-8');
}
