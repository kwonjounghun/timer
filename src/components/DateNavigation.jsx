import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDate, changeDate, getTodayString } from '../utils/dateUtils';

export const DateNavigation = ({ 
  selectedDate, 
  onDateChange, 
  cyclesByDate, 
  sortedCycles, 
  onClearAllData 
}) => {
  const handleDateChange = (direction) => {
    const newDate = changeDate(selectedDate, direction);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(getTodayString());
  };

  return (
    <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 이전 날짜 버튼 */}
          <button
            onClick={() => handleDateChange('prev')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">이전 날짜</span>
          </button>
          
          {/* 중앙: 날짜 정보 */}
          <div className="text-center flex-1 mx-4">
            <div className="flex items-center gap-3 justify-center mb-1">
              <Calendar className="text-blue-500" size={20} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatDate(selectedDate)}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {sortedCycles.length}개 세션 완료
              {Object.keys(cyclesByDate).length > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  • 총 {Object.keys(cyclesByDate).length}일 기록
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
          
          {/* 오른쪽: 다음 날짜 버튼과 설정 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateChange('next')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">다음 날짜</span>
              <ChevronRight size={20} />
            </button>

            {Object.keys(cyclesByDate).length > 0 && (
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
