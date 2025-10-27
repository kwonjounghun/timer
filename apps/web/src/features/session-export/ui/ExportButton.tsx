/**
 * 세션 내보내기 버튼 컴포넌트
 * 사용자가 마크다운 다운로드를 트리거하는 UI
 */

import React from 'react';
import { Download } from 'lucide-react';
import { TimerSession } from '../../new-timer/domain/types';
import { useSessionExport } from '../application/hooks/useSessionExport';

/**
 * 세션 내보내기 버튼 Props
 */
interface ExportButtonProps {
  /** 내보낼 타이머 세션 배열 */
  sessions: TimerSession[];

  /** 내보낼 날짜 (YYYY-MM-DD) */
  date: string;

  /** 내보내기 성공 시 콜백 */
  onSuccess?: () => void;
}

/**
 * 세션 내보내기 버튼
 */
export function ExportButton({ sessions, date, onSuccess }: ExportButtonProps) {
  const { exportAsMarkdown, isExporting, error } = useSessionExport();

  const handleExport = async () => {
    try {
      await exportAsMarkdown(sessions, date);
      onSuccess?.();
    } catch (err) {
      // 에러는 useSessionExport에서 이미 처리됨
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isExporting || sessions.length === 0}
        className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
      >
        <Download size={18} />
        {isExporting ? '내보내는 중...' : 'MD 다운로드'}
      </button>

      {error && <p className='text-sm text-red-500 mt-2'>{error}</p>}
    </div>
  );
}
