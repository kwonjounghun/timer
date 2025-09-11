import { useState } from 'react';
import { DateNavigation } from './components/DateNavigation';
import { DailyChecklist } from './components/DailyChecklist';
import { TimerSection } from './components/TimerSection';
import StorageIndicator from './components/StorageIndicator';
import { useFocusCycles } from './hooks/useFocusCycles';
import { getTodayString } from './utils/dateUtils';

const FocusTimer = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [isDailySystemExpanded, setIsDailySystemExpanded] = useState(true);
  
  const { cyclesByDate, clearAllData } = useFocusCycles();

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const toggleDailySystem = () => {
    setIsDailySystemExpanded(!isDailySystemExpanded);
  };


  // 선택된 날짜의 사이클들 가져오기
  const currentDateCycles = cyclesByDate[selectedDate] || [];
  
  // 시간순으로 정렬
  const sortedCycles = [...currentDateCycles].sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <DateNavigation 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        cyclesByDate={cyclesByDate}
        sortedCycles={sortedCycles}
        onClearAllData={clearAllData}
      />


      {/* 메인 컨텐츠 - 좌우 레이아웃 */}
      <div className="max-w-7xl mx-auto p-6">
        <div className={`grid grid-cols-1 gap-6 ${isDailySystemExpanded ? 'lg:grid-cols-2' : 'lg:grid-cols-1 lg:max-w-4xl lg:mx-auto'}`}>
          
          {/* 왼쪽: 일일 점검 시스템 */}
          <DailyChecklist 
            selectedDate={selectedDate}
            isExpanded={isDailySystemExpanded}
            onToggle={toggleDailySystem}
          />

          {/* 오른쪽: 10분 집중 타이머 */}
          <TimerSection selectedDate={selectedDate} />
        </div>
      </div>

      {/* 스토리지 타입 인디케이터 */}
      <StorageIndicator />
    </div>
  );
};

export default FocusTimer;
