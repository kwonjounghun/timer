/**
 * 작업 입력 컴포넌트 (미니멀 버전)
 * 단순한 텍스트 입력과 엔터키 제출
 */

import React from 'react';

/**
 * 작업 입력 Props
 */
interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/**
 * 작업 입력 컴포넌트
 */
export function TaskInput({ value, onChange, onSubmit, disabled = false }: TaskInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="이번 10분 동안 어떤 작업에 집중하시겠어요?"
      />
    </div>
  );
}
