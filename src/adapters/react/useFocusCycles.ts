import { useAppContext } from './AppContextProvider';
import { 
  FocusCycleStoreState, 
  FocusCycleModel, 
  FocusCycleData 
} from '../../business/types/index';

interface UseFocusCyclesReturn extends FocusCycleStoreState {
  selectedDate: string;
  currentDateCycles: FocusCycleModel[];
  addCycle: (cycleData: Partial<FocusCycleData>) => Promise<FocusCycleModel>;
  editCycle: (cycle: FocusCycleModel) => void;
  updateEditingCycle: (updates: Partial<FocusCycleData>) => void;
  saveEdit: () => Promise<void>;
  cancelEdit: () => void;
  deleteCycle: (cycleId: string) => Promise<boolean>;
  toggleExpand: (cycleId: string) => void;
  clearAllData: () => Promise<boolean>;
  setEditingCycle: (cycle: FocusCycleModel | null) => void;
}

export const useFocusCycles = (): UseFocusCyclesReturn => {
  const appContext = useAppContext();
  const focusCycleState = appContext.focusCycleStore.getState();
  const selectedDate = appContext.selectedDate;
  
  return {
    ...focusCycleState,
    selectedDate,
    currentDateCycles: appContext.getCyclesForSelectedDate(),
    addCycle: (cycleData) => appContext.focusCycleService.saveCycle(cycleData),
    editCycle: (cycle) => appContext.focusCycleStore.startEdit(cycle),
    updateEditingCycle: (updates) => appContext.focusCycleStore.updateEditingCycle(updates),
    saveEdit: async () => {
      const editingCycle = focusCycleState.editingCycle;
      if (editingCycle) {
        await appContext.updateFocusCycle(editingCycle.id, editingCycle);
        appContext.focusCycleStore.cancelEdit();
      }
    },
    cancelEdit: () => appContext.focusCycleStore.cancelEdit(),
    deleteCycle: (cycleId) => appContext.deleteFocusCycle(cycleId),
    toggleExpand: (cycleId) => appContext.focusCycleStore.toggleExpand(cycleId),
    clearAllData: () => appContext.clearAllFocusData(),
    setEditingCycle: (cycle) => cycle ? appContext.focusCycleStore.startEdit(cycle) : appContext.focusCycleStore.cancelEdit()
  };
};