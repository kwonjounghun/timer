import React from 'react';
import { AppContextProvider } from './adapters/react/AppContextProvider';
import { useApp } from './adapters/react/useApp';
import { DateNavigation } from './components/DateNavigation';
import { DailyChecklist } from './components/DailyChecklist';
import { TimerSection } from './components/TimerSection';
import StorageIndicator from './components/StorageIndicator';

const FocusTimerContent: React.FC = () => {
  const { 
    selectedDate, 
    isDailySystemExpanded, 
    focusCycleState,
    setSelectedDate, 
    toggleDailySystem, 
    getCyclesForDate 
  } = useApp();

  const currentDateCycles = getCyclesForDate(selectedDate);
  const sortedCycles = [...currentDateCycles].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const clearAllData = async () => {
    // This will be handled by the new architecture
    console.log('Clear all data functionality needs to be implemented');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <DateNavigation 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        cyclesByDate={focusCycleState.cyclesByDate}
        sortedCycles={sortedCycles}
        onClearAllData={clearAllData}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className={`grid grid-cols-1 gap-6 ${isDailySystemExpanded ? 'lg:grid-cols-2' : 'lg:grid-cols-1 lg:max-w-4xl lg:mx-auto'}`}>
          
          <DailyChecklist 
            selectedDate={selectedDate}
            isExpanded={isDailySystemExpanded}
            onToggle={toggleDailySystem}
          />

          <TimerSection selectedDate={selectedDate} />
        </div>
      </div>

      <StorageIndicator />
    </div>
  );
};

const FocusTimer: React.FC = () => {
  return (
    <AppContextProvider>
      <FocusTimerContent />
    </AppContextProvider>
  );
};

export default FocusTimer;