/**
 * 타이머 컨트롤 컴포넌트 (미니멀 버전)
 * 상태에 따른 버튼들을 표시
 */

import React from 'react';
import { TimerStatus } from '../../domain/types';

/**
 * 타이머 컨트롤 Props
 */
interface TimerControlsProps {
  status: TimerStatus;
  canStart: boolean;
  canPause: boolean;
  canStop: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

/**
 * 타이머 컨트롤 컴포넌트
 */
export function TimerControls({
  status,
  canStart,
  canPause,
  canStop,
  onStart,
  onPause,
  onResume,
  onStop
}: TimerControlsProps) {
  return (
    <div className="flex gap-4 justify-center">
      {/* 시작/재개 버튼 */}
      {canStart && (
        <button
          onClick={status === 'PAUSED' ? onResume : onStart}
          className="bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          {status === 'PAUSED' ? '재개' : '시작'}
        </button>
      )}
      
      {/* 일시정지 버튼 */}
      {canPause && (
        <button
          onClick={onPause}
          className="bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          일시정지
        </button>
      )}
      
      {/* 중단 버튼 */}
      {canStop && (
        <button
          onClick={onStop}
          className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          중단
        </button>
      )}
    </div>
  );
}
