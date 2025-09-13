import { TimerStore } from './stores/TimerStore';
import { FocusCycleStore } from './stores/FocusCycleStore';
import { DailyChecklistStore } from './stores/DailyChecklistStore';
import { FocusCycleService } from './services/FocusCycleService';
import { DailyChecklistService } from './services/DailyChecklistService';
import { AudioService } from './services/AudioService';
import { getStorageInfo } from '../utils/storageType';
import { getTodayString } from '../utils/dateUtils';
import { 
  AppState, 
  StorageInfo, 
  FocusCycleModel,
  DailyChecklistModel,
  FocusCycleData,
  SubscriberCallback 
} from './types/index';

export class AppContext {
  public readonly timerStore: TimerStore;
  public readonly focusCycleStore: FocusCycleStore;
  public readonly dailyChecklistStore: DailyChecklistStore;
  
  public readonly focusCycleService: FocusCycleService;
  public readonly dailyChecklistService: DailyChecklistService;
  public readonly audioService: AudioService;
  
  private _selectedDate: string;
  private _isDailySystemExpanded: boolean = true;
  private readonly _storageInfo: any; // StorageInfo - temp fix for JS utils
  
  private timerUpdateInterval: NodeJS.Timeout | null = null;
  private subscribers = new Set<SubscriberCallback>();

  constructor() {
    this.timerStore = new TimerStore();
    this.focusCycleStore = new FocusCycleStore();
    this.dailyChecklistStore = new DailyChecklistStore();
    
    this.focusCycleService = new FocusCycleService();
    this.dailyChecklistService = new DailyChecklistService();
    this.audioService = new AudioService();
    
    this._selectedDate = getTodayString();
    this._storageInfo = getStorageInfo();
    
    this.init();
  }

  get selectedDate(): string {
    return this._selectedDate;
  }

  get isDailySystemExpanded(): boolean {
    return this._isDailySystemExpanded;
  }

  get storageInfo(): any {
    return this._storageInfo;
  }

  private async init(): Promise<void> {
    try {
      await this.loadInitialData();
      this.setupTimerUpdates();
      this.setupTimerCallbacks();
    } catch (error) {
      console.error('Failed to initialize app context:', error);
    }
  }

  subscribe(callback: SubscriberCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(callback => callback());
  }

  private async loadInitialData(): Promise<void> {
    this.focusCycleStore.setLoading(true);
    this.dailyChecklistStore.setLoading(true);

    try {
      const [cyclesByDate, checklistsByDate] = await Promise.all([
        this.focusCycleService.loadAllCycles(),
        this.dailyChecklistService.loadAllChecklists()
      ]);

      this.focusCycleStore.setCyclesByDate(cyclesByDate);
      this.dailyChecklistStore.setChecklistsByDate(checklistsByDate);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      this.focusCycleStore.setLoading(false);
      this.dailyChecklistStore.setLoading(false);
    }
  }

  private setupTimerUpdates(): void {
    this.timerUpdateInterval = setInterval(() => {
      this.timerStore.updateTimer();
    }, 100);

    if (typeof window !== 'undefined') {
      const handleVisibilityChange = (): void => {
        if (!document.hidden) {
          this.timerStore.updateTimer();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  }

  private setupTimerCallbacks(): void {
    this.timerStore.setOnTimerComplete(() => {
      const timerState = this.timerStore.getState();
      this.audioService.playNotification(timerState.currentTask);
    });
  }

  setSelectedDate(date: string): void {
    this._selectedDate = date;
    this.notify();
  }

  toggleDailySystem(): void {
    this._isDailySystemExpanded = !this._isDailySystemExpanded;
    this.notify();
  }

  async saveTimerReflection(): Promise<FocusCycleModel> {
    try {
      const cycleData = this.timerStore.getCycleData();
      const cycle = await this.focusCycleService.saveCycle({
        ...cycleData,
        date: this._selectedDate
      });

      this.focusCycleStore.addCycle(this._selectedDate, cycle);
      this.timerStore.resetToInitialState();
      
      return cycle;
    } catch (error) {
      console.error('Failed to save timer reflection:', error);
      throw error;
    }
  }

  async updateFocusCycle(cycleId: string, updates: Partial<FocusCycleData>): Promise<boolean> {
    try {
      const cycle = this.getFocusCycleById(cycleId);
      if (!cycle) return false;

      cycle.update(updates);
      await this.focusCycleService.updateCycle(cycle);
      this.focusCycleStore.updateCycle(this._selectedDate, cycleId, updates);
      
      return true;
    } catch (error) {
      console.error('Failed to update focus cycle:', error);
      throw error;
    }
  }

  async deleteFocusCycle(cycleId: string): Promise<boolean> {
    try {
      await this.focusCycleService.deleteCycle(cycleId);
      this.focusCycleStore.deleteCycle(this._selectedDate, cycleId);
      return true;
    } catch (error) {
      console.error('Failed to delete focus cycle:', error);
      throw error;
    }
  }

  async clearAllFocusData(): Promise<boolean> {
    if (!window.confirm('모든 집중 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return false;
    }

    try {
      await this.focusCycleService.deleteAllCycles();
      this.focusCycleStore.clearAllCycles();
      return true;
    } catch (error) {
      console.error('Failed to clear all focus data:', error);
      throw error;
    }
  }

  async updateChecklistAnswer(section: string, questionIndex: number, answer: string): Promise<void> {
    this.dailyChecklistStore.updateAnswer(
      this._selectedDate, 
      section, 
      questionIndex, 
      answer,
      async (updatedChecklist: DailyChecklistModel) => {
        try {
          await this.dailyChecklistService.saveChecklist(updatedChecklist);
        } catch (error) {
          console.error('Failed to save checklist:', error);
        }
      }
    );
  }

  getFocusCycleById(cycleId: string): FocusCycleModel | undefined {
    const cycles = this.focusCycleStore.getCyclesForDate(this._selectedDate);
    return cycles.find(cycle => cycle.id === cycleId);
  }

  getCyclesForSelectedDate(): FocusCycleModel[] {
    return this.focusCycleStore.getCyclesForDate(this._selectedDate);
  }

  getChecklistForSelectedDate(): DailyChecklistModel {
    return this.dailyChecklistStore.getChecklistForDate(this._selectedDate);
  }

  getAppState(): AppState {
    return {
      selectedDate: this._selectedDate,
      isDailySystemExpanded: this._isDailySystemExpanded,
      storageInfo: this._storageInfo,
      timerState: this.timerStore.getState(),
      focusCycleState: this.focusCycleStore.getState(),
      dailyChecklistState: this.dailyChecklistStore.getState(),
      audioPermission: this.audioService.getNotificationPermission()
    };
  }

  destroy(): void {
    if (this.timerUpdateInterval) {
      clearInterval(this.timerUpdateInterval);
    }
    
    this.dailyChecklistStore.clearSaveCallbacks();
    this.subscribers.clear();
  }
}