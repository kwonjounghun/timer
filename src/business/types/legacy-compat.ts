// =====================================
// LEGACY COMPATIBILITY TYPES
// =====================================

// Simple types that work with existing code
export type UUID = string;
export type DateString = string;
export type Seconds = number;

export type ChecklistSection = 'morning' | 'lunch' | 'evening';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type NotificationPermission = 'granted' | 'denied' | 'default';
export type StorageType = 'localStorage' | 'firebase';

// Callback types
export type TimerCompleteCallback = () => void;
export type SubscriberCallback<T = any> = (state?: T) => void;
export type SaveCallback = (checklist: any) => Promise<void>;

// Basic interfaces that match existing code
export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  initialTime: number;
}

export interface ReflectionData {
  result: string;
  distractions: string;
  thoughts: string;
}

export interface FocusCycleData {
  id?: string;
  date: string;
  task: string;
  startTime: Date | string;
  endTime: Date | string;
  timeSpent: number;
  result: string;
  distractions: string;
  thoughts: string;
}

export interface DailyChecklistData {
  id?: string;
  date: string;
  data: Record<string, Record<number, string>>;
}

export interface ProgressInfo {
  answered: number;
  total: number;
  percentage: number;
}

export interface SectionExpansionState {
  morning: boolean;
  lunch: boolean;
  evening: boolean;
}

export interface ChecklistTemplate {
  [key: string]: {
    title: string;
    questions: string[];
  };
}

export interface DailyStats {
  totalTime: number;
  totalCycles: number;
  averageTime: number;
  formattedTotalTime: string;
  formattedAverageTime: string;
}

export interface StorageInfo {
  type: StorageType;
  isFirebase: boolean;
  isLocalStorage: boolean;
  config: any;
}

// Store state types
export interface TimerStoreState {
  timerState: TimerState;
  currentTask: string;
  timerStartTime: Date | null;
  timerEndTime: Date | null;
  showTaskInput: boolean;
  showReflection: boolean;
  reflection: ReflectionData;
  formattedTime: string;
}

export interface FocusCycleStoreState {
  cyclesByDate: Record<string, any[]>;
  expandedCycles: Set<string>;
  editingCycle: any | null;
  isLoading: boolean;
}

export interface DailyChecklistStoreState {
  checklistsByDate: Record<string, any>;
  expandedSections: SectionExpansionState;
  editMode: boolean;
  isLoading: boolean;
}

export interface AppState {
  selectedDate: string;
  isDailySystemExpanded: boolean;
  storageInfo: StorageInfo;
  timerState: TimerStoreState;
  focusCycleState: FocusCycleStoreState;
  dailyChecklistState: DailyChecklistStoreState;
  audioPermission: NotificationPermission;
}

// Model types for compatibility
export const FocusCycleModel = class {
  constructor(data: FocusCycleData) {
    Object.assign(this, data);
  }
};

export const DailyChecklistModel = class {
  constructor(data: DailyChecklistData) {
    Object.assign(this, data);
  }
};