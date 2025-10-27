import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { changeDate, formatDate, getTodayString } from '../utils/dateUtils';

interface DateNavigationProps {
  onClearAllData?: () => void;
}

export const DateNavigationRefactored: React.FC<DateNavigationProps> = ({ onClearAllData }) => {
  const { selectedDate, setSelectedDate } = useAppContext();

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = changeDate(selectedDate, direction);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(getTodayString());
  };

  // 기존 타이머 사이클 데이터 제거 - 새 타이머 시스템으로 대체됨
  // const { cycleCount, totalDays } = { cycleCount: 0, totalDays: 0 };

  return (
    <div className='bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-4xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Left: Previous date button */}
          <button
            onClick={() => handleDateChange('prev')}
            className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
          >
            <ChevronLeft size={20} />
            <span className='hidden sm:inline'>이전 날짜</span>
          </button>

          {/* Center: Date info */}
          <div className='text-center flex-1 mx-4'>
            <div className='flex items-center gap-3 justify-center mb-1'>
              <Calendar className='text-blue-500' size={20} />
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800'>
                {formatDate(selectedDate)}
              </h2>
            </div>
            {/* 세션 카운트는 새 타이머 시스템에서 관리 */}
            {selectedDate !== getTodayString() && (
              <button
                onClick={goToToday}
                className='text-xs text-blue-500 hover:text-blue-700 underline mt-1'
              >
                오늘로 이동
              </button>
            )}
          </div>

          {/* Right: Next date button and settings */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => handleDateChange('next')}
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
            >
              <span className='hidden sm:inline'>다음 날짜</span>
              <ChevronRight size={20} />
            </button>

            {onClearAllData && (
              <button
                onClick={onClearAllData}
                className='px-3 py-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
                title='모든 기록 삭제'
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
