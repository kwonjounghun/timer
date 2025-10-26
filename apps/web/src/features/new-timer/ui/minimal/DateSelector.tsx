/**
 * 날짜 선택 컴포넌트 (미니멀 버전)
 * 이전/다음 날짜 버튼과 현재 날짜 표시
 */

import React from 'react';
import { dateUtils } from '../../application/context/TimerContext';

/**
 * 날짜 선택 Props
 */
interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

/**
 * 날짜 선택 컴포넌트
 */
export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    onDateChange(currentDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    onDateChange(currentDate.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(dateUtils.getToday());
  };

  const isToday = dateUtils.isToday(selectedDate);
  const isPast = dateUtils.isPast(selectedDate);
  const isFuture = dateUtils.isFuture(selectedDate);

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* 이전 날짜 버튼 */}
      <button
        onClick={handlePreviousDay}
        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        ←
      </button>
      
      {/* 현재 날짜 표시 */}
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-800">
          {dateUtils.formatDate(selectedDate)}
        </div>
        <div className="text-sm text-gray-500">
          {selectedDate}
        </div>
      </div>
      
      {/* 다음 날짜 버튼 */}
      <button
        onClick={handleNextDay}
        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        →
      </button>
      
      {/* 오늘로 돌아가기 버튼 */}
      {!isToday && (
        <button
          onClick={handleToday}
          className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 transition-colors"
        >
          오늘
        </button>
      )}
    </div>
  );
}
