import { useAppContext } from './AppContextProvider';
import { AppState, FocusCycleModel } from '../../business/types/index';

interface UseAppReturn extends AppState {
  setSelectedDate: (date: string) => void;
  toggleDailySystem: () => void;
  getCyclesForDate: (date: string) => FocusCycleModel[];
}

export const useApp = (): UseAppReturn => {
  const appContext = useAppContext();
  const appState = appContext.getAppState();
  
  return {
    ...appState,
    setSelectedDate: (date: string) => appContext.setSelectedDate(date),
    toggleDailySystem: () => appContext.toggleDailySystem(),
    getCyclesForDate: (date: string) => {
      const focusCycleState = appContext.focusCycleStore.getState();
      return appContext.focusCycleService.getCyclesForDate(focusCycleState.cyclesByDate, date);
    }
  };
};