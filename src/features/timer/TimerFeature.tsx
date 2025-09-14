import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useTimerLogic } from './hooks/useTimerLogic';
import { useCycleHistory } from './hooks/useCycleHistory';
import { TimerSection } from './components/TimerSection';
import { CycleHistory } from './components/CycleHistory';

export const TimerFeature: React.FC = () => {
  const { selectedDate } = useAppContext();

  // 비즈니스 로직을 커스텀 훅으로 분리
  const cycleHistory = useCycleHistory(selectedDate);
  const timerLogic = useTimerLogic(selectedDate, cycleHistory.addCycle);

  return (
    <div className="space-y-8">
      <TimerSection
        timerLogic={timerLogic}
        selectedDate={selectedDate}
      />
      <CycleHistory
        cycleHistory={cycleHistory}
        selectedDate={selectedDate}
      />
    </div>
  );
};