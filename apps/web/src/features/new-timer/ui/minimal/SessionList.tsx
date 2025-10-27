/**
 * 세션 리스트 컴포넌트 (미니멀 버전)
 * 세션 목록을 표시하고 SessionCard 사용
 */

import React from 'react';
import { TimerSession } from '../../domain/types';
import { SessionCard } from './SessionCard';

/**
 * 세션 리스트 Props
 */
interface SessionListProps {
  sessions: TimerSession[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * 세션 리스트 컴포넌트
 */
export function SessionList({ 
  sessions, 
  onEdit, 
  onDelete, 
  loading = false,
  emptyMessage = '아직 완료된 세션이 없습니다.'
}: SessionListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">세션을 불러오는 중...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
