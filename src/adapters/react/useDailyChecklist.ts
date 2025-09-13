import { useAppContext } from './AppContextProvider';
import { 
  DailyChecklistStoreState, 
  DailyChecklistModel,
  ChecklistTemplate,
  ChecklistSection 
} from '../../business/types/index';

interface UseDailyChecklistReturn extends DailyChecklistStoreState {
  selectedDate: string;
  storageType: string;
  firebaseConnectionStatus: null;
  checkData: Record<string, DailyChecklistModel>;
  toggleSection: (section: ChecklistSection) => void;
  updateAnswer: (section: string, questionIndex: number, value: string) => void;
  toggleEditMode: () => void;
  completeEdit: () => void;
  cancelEdit: () => void;
  hasCheckDataForSelectedDate: () => boolean;
  getChecklistTemplate: () => ChecklistTemplate;
}

export const useDailyChecklist = (): UseDailyChecklistReturn => {
  const appContext = useAppContext();
  const checklistState = appContext.dailyChecklistStore.getState();
  const selectedDate = appContext.selectedDate;
  const storageInfo = appContext.storageInfo;
  
  return {
    ...checklistState,
    selectedDate,
    storageType: storageInfo.type,
    firebaseConnectionStatus: null, // This could be enhanced if needed
    checkData: checklistState.checklistsByDate,
    toggleSection: (section: ChecklistSection) => appContext.dailyChecklistStore.toggleSection(section),
    updateAnswer: (section: string, questionIndex: number, value: string) => 
      appContext.updateChecklistAnswer(section, questionIndex, value),
    toggleEditMode: () => appContext.dailyChecklistStore.setEditMode(true),
    completeEdit: () => appContext.dailyChecklistStore.setEditMode(false),
    cancelEdit: () => appContext.dailyChecklistStore.setEditMode(false),
    hasCheckDataForSelectedDate: () => appContext.dailyChecklistStore.hasDataForDate(selectedDate),
    getChecklistTemplate: () => appContext.dailyChecklistService.getChecklistTemplate()
  };
};