import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useTimer } from './application/use-timer';
import { useCycleHistory } from './application/use-cycle-history';
import { TimerSection } from './ui/TimerSection';
import { CycleHistory } from './ui/CycleHistory';

/**
 * 타이머 Feature 진입점
 * Feature-Sliced Design 아키텍처를 따른 리팩토링된 타이머 기능
 */
export const TimerFeature: React.FC = () => {
  const { selectedDate } = useAppContext();

  // 애플리케이션 레이어 Hook 사용
  const timer = useTimer(selectedDate);
  const cycleHistory = useCycleHistory(selectedDate);

  return (
    <div className="space-y-8">
      <TimerSection
        timerState={timer.timerState}
        currentTask={timer.currentTask}
        reflection={timer.reflection}
        notificationPermission={timer.notificationPermission}
        isNotificationSupported={timer.isNotificationSupported}
        setCurrentTask={timer.setCurrentTask}
        startTimer={timer.startTimer}
        pauseTimer={timer.pauseTimer}
        stopTimer={timer.stopTimer}
        saveReflection={timer.saveReflection}
        updateReflection={timer.updateReflection}
        formatTime={timer.formatTime}
        requestNotificationPermission={timer.requestNotificationPermission}
      />
      <CycleHistory
        sortedCycles={cycleHistory.sortedCycles}
        expandedCycles={cycleHistory.expandedCycles}
        loading={cycleHistory.loading}
        error={cycleHistory.error}
        toggleExpand={cycleHistory.toggleExpand}
        updateCycle={cycleHistory.updateCycle}
        deleteCycle={cycleHistory.deleteCycle}
        selectedDate={selectedDate}
      />
    </div>
  );
};

// 도메인 타입들도 export (다른 feature에서 사용할 수 있도록)
export * from './domain/types';
export * from './domain/timer-calculator';
export * from './domain/timer-state-machine';
export * from './domain/cycle-manager';

// 인프라 서비스들도 export (테스트나 다른 용도로 사용할 수 있도록)
export * from './infrastructure/firebase-repository';
export * from './infrastructure/notification-service';

// 애플리케이션 Hook들도 export (다른 컴포넌트에서 직접 사용할 수 있도록)
export * from './application/use-timer';
export * from './application/use-cycle-history';
