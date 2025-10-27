/**
 * 세션 카드 컴포넌트 (미니멀 버전)
 * 개별 세션을 미니멀한 카드로 표시
 */

import React, { useState } from 'react';
import { TimerSession } from '../../domain/types';
import { formatTime } from '../../domain/timer-logic';

/**
 * 세션 카드 Props
 */
interface SessionCardProps {
  session: TimerSession;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * 세션 카드 컴포넌트
 */
export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(session.id);
    } catch (error) {
      console.error('세션 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 세션 정보 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 text-lg">
            {session.task}
          </h4>
          <div className="text-sm text-gray-500">
            {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-blue-600">
            {formatTime(session.duration)}
          </div>
          <div className="text-xs text-gray-400">
            소요 시간
          </div>
        </div>
      </div>
      
      {/* 회고 내용 */}
      {(session.result || session.distractions || session.thoughts) && (
        <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded space-y-2">
          {session.result && (
            <div>
              <span className="font-medium text-gray-700">결과:</span> {session.result}
            </div>
          )}
          {session.distractions && (
            <div>
              <span className="font-medium text-gray-700">방해요소:</span> {session.distractions}
            </div>
          )}
          {session.thoughts && (
            <div>
              <span className="font-medium text-gray-700">회고:</span> {session.thoughts}
            </div>
          )}
        </div>
      )}
      
      {/* 액션 버튼들 */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={() => onEdit(session.id)}
              className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            >
              수정
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 text-sm hover:text-red-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
