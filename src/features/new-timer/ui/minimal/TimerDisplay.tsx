/**
 * 타이머 디스플레이 컴포넌트 (미니멀 버전)
 * 큰 타이머 숫자와 작업명을 표시
 */

import React from 'react';
import { TimerStatus } from '../../domain/types';

/**
 * 타이머 디스플레이 Props
 */
interface TimerDisplayProps {
  time: string;        // "10:00"
  task: string;
  status: TimerStatus;
}

/**
 * 타이머 디스플레이 컴포넌트
 */
export function TimerDisplay({ time, task, status }: TimerDisplayProps) {
  // 상태별 스타일 결정
  const getStatusStyles = () => {
    switch (status) {
      case 'RUNNING':
        return 'text-blue-600';
      case 'PAUSED':
        return 'text-yellow-600';
      case 'COMPLETED':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="text-center">
      {/* 타이머 숫자 */}
      <div className={`text-8xl font-mono font-bold mb-4 ${getStatusStyles()}`}>
        {time}
      </div>
      
      {/* 작업명 */}
      {task && (
        <div className="text-2xl text-gray-700 font-medium mb-2">
          {task}
        </div>
      )}
      
      {/* 상태 표시 */}
      <div className="text-sm text-gray-500">
        {status === 'RUNNING' && '집중 중...'}
        {status === 'PAUSED' && '일시정지됨'}
        {status === 'COMPLETED' && '완료됨'}
        {status === 'IDLE' && '대기 중'}
      </div>
    </div>
  );
}
