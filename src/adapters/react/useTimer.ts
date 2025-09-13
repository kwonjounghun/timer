import { useAppContext } from './AppContextProvider';
import { TimerStoreState, FocusCycleModel } from '../../business/types/index';

interface UseTimerReturn extends TimerStoreState {
  setCurrentTask: (task: string) => void;
  startTimer: () => boolean;
  pauseTimer: () => void;
  stopTimer: () => void;
  updateReflection: (field: keyof TimerStoreState['reflection'], value: string) => void;
  saveReflection: () => Promise<FocusCycleModel>;
  resetTimer: () => void;
}

export const useTimer = (): UseTimerReturn => {
  const appContext = useAppContext();
  const timerState = appContext.timerStore.getState();
  
  return {
    ...timerState,
    setCurrentTask: (task: string) => appContext.timerStore.setCurrentTask(task),
    startTimer: () => appContext.timerStore.startTimer(),
    pauseTimer: () => appContext.timerStore.pauseTimer(),
    stopTimer: () => appContext.timerStore.stopTimer(),
    updateReflection: (field, value) => appContext.timerStore.updateReflection(field, value),
    saveReflection: () => appContext.saveTimerReflection(),
    resetTimer: () => appContext.timerStore.resetToInitialState()
  };
};