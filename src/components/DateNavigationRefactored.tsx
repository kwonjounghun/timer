import React, { useCallback, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { formatDate, changeDate, getTodayString } from '../utils/dateUtils';

interface DateNavigationProps {
  onClearAllData?: () => void;
}

export const DateNavigationRefactored: React.FC<DateNavigationProps> = ({ onClearAllData }) => {
  const { selectedDate, setSelectedDate } = useAppContext();
  const [cycleData, setCycleData] = useState({ cycleCount: 0, totalDays: 0 });

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = changeDate(selectedDate, direction);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(getTodayString());
  };

  // Get actual cycle data from localStorage
  const updateCycleData = useCallback(() => {
    try {
      const saved = localStorage.getItem('focusCycles');
      if (saved) {
        const cycles = JSON.parse(saved);
        const todayCycles = cycles.filter((cycle: any) => cycle.date === selectedDate);
        const totalDays = new Set(cycles.map((cycle: any) => cycle.date)).size;
        setCycleData({
          cycleCount: todayCycles.length,
          totalDays
        });
      } else {
        setCycleData({ cycleCount: 0, totalDays: 0 });
      }
    } catch (error) {
      console.error('Failed to parse cycle data:', error);
      setCycleData({ cycleCount: 0, totalDays: 0 });
    }
  }, [selectedDate]);

  // Update cycle data when selectedDate changes
  useEffect(() => {
    updateCycleData();
  }, [updateCycleData]);

  // Listen for localStorage changes (when new cycles are added)
  useEffect(() => {
    const handleStorageChange = () => {
      updateCycleData();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    window.addEventListener('cycleAdded', handleStorageChange);
    window.addEventListener('cycleUpdated', handleStorageChange);
    window.addEventListener('cycleDeleted', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cycleAdded', handleStorageChange);
      window.removeEventListener('cycleUpdated', handleStorageChange);
      window.removeEventListener('cycleDeleted', handleStorageChange);
    };
  }, [updateCycleData]);

  const { cycleCount, totalDays } = cycleData;

  return (
    <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Previous date button */}
          <button
            onClick={() => handleDateChange('prev')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">이전 날짜</span>
          </button>

          {/* Center: Date info */}
          <div className="text-center flex-1 mx-4">
            <div className="flex items-center gap-3 justify-center mb-1">
              <Calendar className="text-blue-500" size={20} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatDate(selectedDate)}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {cycleCount}개 세션 완료
              {totalDays > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  • 총 {totalDays}일 기록
                </span>
              )}
            </div>
            {selectedDate !== getTodayString() && (
              <button
                onClick={goToToday}
                className="text-xs text-blue-500 hover:text-blue-700 underline mt-1"
              >
                오늘로 이동
              </button>
            )}
          </div>

          {/* Right: Next date button and settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateChange('next')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">다음 날짜</span>
              <ChevronRight size={20} />
            </button>

            {onClearAllData && totalDays > 0 && (
              <button
                onClick={onClearAllData}
                className="px-3 py-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="모든 기록 삭제"
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