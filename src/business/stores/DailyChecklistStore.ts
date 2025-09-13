import { DailyChecklistModel } from '../models/DailyChecklistModel';
import { 
  DailyChecklistStoreState, 
  DailyChecklistData,
  SectionExpansionState,
  ChecklistSection,
  ProgressInfo,
  SaveCallback,
  SubscriberCallback 
} from '../types/index';

export class DailyChecklistStore {
  private checklistsByDate: Record<string, DailyChecklistModel> = {};
  private expandedSections: SectionExpansionState = {
    morning: false,
    lunch: false,
    evening: false
  };
  private editMode: boolean = false;
  private isLoading: boolean = false;
  private subscribers = new Set<SubscriberCallback<DailyChecklistStoreState>>();
  private saveCallbacks = new Map<string, NodeJS.Timeout>();

  subscribe(callback: SubscriberCallback<DailyChecklistStoreState>): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(callback => callback(this.getState()));
  }

  getState(): DailyChecklistStoreState {
    return {
      checklistsByDate: { ...this.checklistsByDate },
      expandedSections: { ...this.expandedSections },
      editMode: this.editMode,
      isLoading: this.isLoading
    };
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.notify();
  }

  setChecklistsByDate(checklistsByDate: Record<string, DailyChecklistModel | DailyChecklistData>): void {
    this.checklistsByDate = {};
    
    Object.keys(checklistsByDate).forEach(date => {
      const checklistData = checklistsByDate[date];
      this.checklistsByDate[date] = checklistData instanceof DailyChecklistModel 
        ? checklistData 
        : new DailyChecklistModel({ date, data: checklistData as any });
    });
    
    this.notify();
  }

  getChecklistForDate(date: string): DailyChecklistModel {
    if (!this.checklistsByDate[date]) {
      this.checklistsByDate[date] = new DailyChecklistModel({ date, data: {} });
      this.notify();
    }
    return this.checklistsByDate[date];
  }

  updateAnswer(
    date: string, 
    section: string, 
    questionIndex: number, 
    answer: string, 
    onSave?: SaveCallback
  ): void {
    const checklist = this.getChecklistForDate(date);
    checklist.updateAnswer(section, questionIndex, answer);
    
    // Debouncing for save callback
    const timeoutKey = `${date}-${section}-${questionIndex}`;
    
    if (this.saveCallbacks.has(timeoutKey)) {
      clearTimeout(this.saveCallbacks.get(timeoutKey)!);
    }
    
    if (onSave) {
      const timeoutId = setTimeout(() => {
        onSave(checklist);
        this.saveCallbacks.delete(timeoutKey);
      }, 500);
      
      this.saveCallbacks.set(timeoutKey, timeoutId);
    }
    
    this.notify();
  }

  toggleSection(section: ChecklistSection): void {
    this.expandedSections[section] = !this.expandedSections[section];
    this.notify();
  }

  setEditMode(editMode: boolean): void {
    this.editMode = editMode;
    if (editMode) {
      this.expandedSections.morning = true;
    }
    this.notify();
  }

  hasDataForDate(date: string): boolean {
    const checklist = this.checklistsByDate[date];
    return checklist ? checklist.hasAnswers() : false;
  }

  getAllDates(): string[] {
    return Object.keys(this.checklistsByDate).sort().reverse();
  }

  getSectionProgress(date: string, section: ChecklistSection): ProgressInfo {
    const checklist = this.checklistsByDate[date];
    return checklist ? checklist.getSectionProgress(section) : { answered: 0, total: 0, percentage: 0 };
  }

  getOverallProgress(date: string): ProgressInfo {
    const checklist = this.checklistsByDate[date];
    return checklist ? checklist.getOverallProgress() : { answered: 0, total: 0, percentage: 0 };
  }

  clearSaveCallbacks(): void {
    this.saveCallbacks.forEach(timeoutId => clearTimeout(timeoutId));
    this.saveCallbacks.clear();
  }
}