// =====================================
// BUSINESS LOGIC INTERFACE DEFINITIONS
// =====================================

import { 
  UUID, 
  DateString, 
  Timer, 
  FocusSession, 
  DailyChecklist,
  DailyFocusRecord,
  TaskDescription,
  Reflection,
  TimeRange,
  ChecklistSection,
  TimerStatus,
  NotificationPermission,
  StorageConfig,
  DomainEvent,
  Command
} from '../domain/index';

import { 
  Result, 
  AsyncResult,
  Unsubscribe,
  Subscriber
} from './utils';

// =====================================
// CORE SERVICE INTERFACES
// =====================================

// Timer Service Interface
export interface ITimerService {
  // Core timer operations
  create(durationSeconds: number): Timer;
  start(timer: Timer, task: TaskDescription): Result<Timer>;
  pause(timer: Timer): Result<Timer>;
  resume(timer: Timer): Result<Timer>;
  stop(timer: Timer): Result<Timer>;
  reset(timer: Timer): Result<Timer>;
  
  // Timer state queries
  getCurrentTime(timer: Timer): number;
  getProgress(timer: Timer): number; // 0-100
  getStatus(timer: Timer): TimerStatus;
  isCompleted(timer: Timer): boolean;
  
  // Timer utilities
  formatTime(seconds: number): string;
  validateTask(task: string): TaskDescription;
}

// Focus Session Service Interface
export interface IFocusSessionService {
  // CRUD operations
  create(session: Omit<FocusSession, 'id' | 'createdAt' | 'updatedAt'>): AsyncResult<FocusSession>;
  getById(id: UUID): AsyncResult<FocusSession>;
  getByDate(date: DateString): AsyncResult<readonly FocusSession[]>;
  getByDateRange(startDate: DateString, endDate: DateString): AsyncResult<readonly FocusSession[]>;
  update(id: UUID, updates: Partial<FocusSession>): AsyncResult<FocusSession>;
  delete(id: UUID): AsyncResult<void>;
  
  // Aggregations
  getDailyStats(date: DateString): AsyncResult<{
    totalSessions: number;
    totalFocusTime: number;
    averageSessionTime: number;
    completionRate: number;
  }>;
  
  getWeeklyStats(weekStartDate: DateString): AsyncResult<{
    totalSessions: number;
    totalFocusTime: number;
    dailyAverages: Record<DateString, number>;
  }>;
  
  // Search and filtering
  searchSessions(query: string, filters?: {
    dateRange?: { start: DateString; end: DateString };
    minDuration?: number;
    maxDuration?: number;
    hasReflection?: boolean;
  }): AsyncResult<readonly FocusSession[]>;
}

// Daily Checklist Service Interface
export interface IDailyChecklistService {
  // CRUD operations
  create(checklist: Omit<DailyChecklist, 'id' | 'createdAt' | 'updatedAt'>): AsyncResult<DailyChecklist>;
  getByDate(date: DateString): AsyncResult<DailyChecklist | null>;
  updateAnswer(
    date: DateString, 
    section: ChecklistSection, 
    questionId: number, 
    answer: string
  ): AsyncResult<DailyChecklist>;
  delete(date: DateString): AsyncResult<void>;
  
  // Template and validation
  getTemplate(): {
    sections: Record<ChecklistSection, {
      title: string;
      questions: readonly { id: number; text: string }[];
    }>;
  };
  
  validateAnswer(questionId: number, answer: string): Result<string>;
  
  // Progress tracking
  getCompletionStatus(date: DateString): AsyncResult<{
    overall: number; // 0-100
    sections: Record<ChecklistSection, number>;
  }>;
  
  // Export functionality
  exportToMarkdown(date: DateString): AsyncResult<string>;
  exportToJson(date: DateString): AsyncResult<object>;
}

// Audio/Notification Service Interface
export interface IAudioService {
  // Notification management
  getPermissionStatus(): NotificationPermission;
  requestPermission(): AsyncResult<NotificationPermission>;
  
  // Notification display
  showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    actions?: readonly { action: string; title: string }[];
  }): AsyncResult<void>;
  
  // Sound playback
  playSound(soundId: 'timer-complete' | 'timer-start' | 'error'): AsyncResult<void>;
  setSoundEnabled(enabled: boolean): void;
  isSoundEnabled(): boolean;
  
  // Custom sounds
  addCustomSound(id: string, audioUrl: string): AsyncResult<void>;
  removeCustomSound(id: string): void;
}

// Storage Service Interface
export interface IStorageService<T> {
  // Basic CRUD
  save(key: string, data: T): AsyncResult<string>;
  load(key: string): AsyncResult<T | null>;
  update(key: string, data: Partial<T>): AsyncResult<T>;
  delete(key: string): AsyncResult<void>;
  
  // Bulk operations
  saveAll(items: Record<string, T>): AsyncResult<Record<string, string>>;
  loadAll(): AsyncResult<Record<string, T>>;
  deleteAll(): AsyncResult<void>;
  
  // Query operations
  find(predicate: (item: T) => boolean): AsyncResult<readonly T[]>;
  findOne(predicate: (item: T) => boolean): AsyncResult<T | null>;
  
  // Storage info
  getStorageInfo(): StorageConfig;
  isOnline(): boolean;
  getLastSyncTime(): Date | null;
}

// =====================================
// STORE/STATE MANAGEMENT INTERFACES
// =====================================

// Timer Store Interface
export interface ITimerStore {
  // State access
  getTimer(): Timer;
  getCurrentTask(): TaskDescription;
  getReflection(): Reflection;
  isReflectionVisible(): boolean;
  isTaskInputVisible(): boolean;
  
  // Actions
  setTask(task: string): void;
  startTimer(): Result<void>;
  pauseTimer(): void;
  stopTimer(): void;
  resetTimer(): void;
  updateReflection(field: keyof Reflection, value: string): void;
  submitReflection(): AsyncResult<FocusSession>;
  
  // Subscriptions
  subscribe(callback: Subscriber<{
    timer: Timer;
    task: TaskDescription;
    reflection: Reflection;
    ui: {
      showTaskInput: boolean;
      showReflection: boolean;
    };
  }>): Unsubscribe;
}

// Focus Session Store Interface
export interface IFocusSessionStore {
  // State access
  getSessions(date: DateString): readonly FocusSession[];
  getExpandedSessions(): ReadonlySet<UUID>;
  getEditingSession(): FocusSession | null;
  isLoading(): boolean;
  
  // Actions
  loadSessions(date: DateString): AsyncResult<void>;
  addSession(session: FocusSession): void;
  updateSession(id: UUID, updates: Partial<FocusSession>): AsyncResult<void>;
  deleteSession(id: UUID): AsyncResult<void>;
  toggleExpand(id: UUID): void;
  startEdit(id: UUID): void;
  cancelEdit(): void;
  saveEdit(): AsyncResult<void>;
  
  // Subscriptions
  subscribe(callback: Subscriber<{
    sessions: Record<DateString, readonly FocusSession[]>;
    expandedSessions: ReadonlySet<UUID>;
    editingSession: FocusSession | null;
    isLoading: boolean;
  }>): Unsubscribe;
}

// Daily Checklist Store Interface
export interface IDailyChecklistStore {
  // State access
  getChecklist(date: DateString): DailyChecklist | null;
  getExpandedSections(): ReadonlySet<ChecklistSection>;
  isEditMode(): boolean;
  isLoading(): boolean;
  
  // Actions
  loadChecklist(date: DateString): AsyncResult<void>;
  updateAnswer(
    date: DateString,
    section: ChecklistSection, 
    questionId: number, 
    answer: string
  ): AsyncResult<void>;
  toggleSection(section: ChecklistSection): void;
  setEditMode(enabled: boolean): void;
  
  // Subscriptions
  subscribe(callback: Subscriber<{
    checklists: Record<DateString, DailyChecklist>;
    expandedSections: ReadonlySet<ChecklistSection>;
    isEditMode: boolean;
    isLoading: boolean;
  }>): Unsubscribe;
}

// App Store Interface (Root Store)
export interface IAppStore {
  // Sub-stores
  readonly timer: ITimerStore;
  readonly focusSessions: IFocusSessionStore;
  readonly dailyChecklist: IDailyChecklistStore;
  
  // Global state
  getSelectedDate(): DateString;
  setSelectedDate(date: DateString): void;
  
  getUIState(): {
    isDailySystemExpanded: boolean;
    theme: 'light' | 'dark' | 'auto';
    sidebarCollapsed: boolean;
  };
  
  updateUIState(updates: Partial<{
    isDailySystemExpanded: boolean;
    theme: 'light' | 'dark' | 'auto';
    sidebarCollapsed: boolean;
  }>): void;
  
  // Global subscriptions
  subscribe(callback: Subscriber<{
    selectedDate: DateString;
    ui: {
      isDailySystemExpanded: boolean;
      theme: 'light' | 'dark' | 'auto';
      sidebarCollapsed: boolean;
    };
  }>): Unsubscribe;
}

// =====================================
// EVENT/COMMAND INTERFACES
// =====================================

// Event Bus Interface
export interface IEventBus {
  publish<T extends DomainEvent>(event: T): void;
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: (event: T) => void
  ): Unsubscribe;
  
  // Async event handling
  publishAsync<T extends DomainEvent>(event: T): AsyncResult<void>;
  subscribeAsync<T extends DomainEvent>(
    eventType: string, 
    handler: (event: T) => Promise<void>
  ): Unsubscribe;
  
  clear(): void;
}

// Command Bus Interface
export interface ICommandBus {
  execute<T extends Command>(command: T): AsyncResult<void>;
  register<T extends Command>(
    commandType: T['type'],
    handler: (command: T) => AsyncResult<void>
  ): void;
  
  unregister(commandType: string): void;
  clear(): void;
}

// =====================================
// REPOSITORY INTERFACES
// =====================================

// Generic Repository Interface
export interface IRepository<T, K = UUID> {
  findById(id: K): AsyncResult<T | null>;
  findAll(): AsyncResult<readonly T[]>;
  save(entity: T): AsyncResult<T>;
  update(id: K, updates: Partial<T>): AsyncResult<T>;
  delete(id: K): AsyncResult<void>;
  exists(id: K): AsyncResult<boolean>;
}

// Focus Session Repository
export interface IFocusSessionRepository extends IRepository<FocusSession> {
  findByDate(date: DateString): AsyncResult<readonly FocusSession[]>;
  findByDateRange(start: DateString, end: DateString): AsyncResult<readonly FocusSession[]>;
  findByTask(taskPattern: string): AsyncResult<readonly FocusSession[]>;
}

// Daily Checklist Repository
export interface IDailyChecklistRepository extends IRepository<DailyChecklist, DateString> {
  findByDateRange(start: DateString, end: DateString): AsyncResult<readonly DailyChecklist[]>;
  findIncomplete(): AsyncResult<readonly DailyChecklist[]>;
}

// =====================================
// FACTORY INTERFACES
// =====================================

// Service Factory
export interface IServiceFactory {
  createTimerService(): ITimerService;
  createFocusSessionService(): IFocusSessionService;
  createDailyChecklistService(): IDailyChecklistService;
  createAudioService(): IAudioService;
  createStorageService<T>(): IStorageService<T>;
}

// Store Factory
export interface IStoreFactory {
  createTimerStore(): ITimerStore;
  createFocusSessionStore(): IFocusSessionStore;
  createDailyChecklistStore(): IDailyChecklistStore;
  createAppStore(): IAppStore;
}

// =====================================
// UTILITY SERVICE INTERFACES
// =====================================

// Validation Service
export interface IValidationService {
  validateTask(task: string): Result<TaskDescription>;
  validateReflection(reflection: Partial<Reflection>): Result<Reflection>;
  validateChecklist(checklist: Partial<DailyChecklist>): Result<DailyChecklist>;
  validateDate(date: string): Result<DateString>;
}

// Export Service
export interface IExportService {
  exportDailyData(date: DateString): AsyncResult<{
    json: object;
    markdown: string;
    csv: string;
  }>;
  
  exportDateRange(start: DateString, end: DateString): AsyncResult<{
    json: object;
    markdown: string;
    csv: string;
  }>;
  
  importData(data: object): AsyncResult<{
    imported: number;
    errors: readonly string[];
  }>;
}

// Analytics Service
export interface IAnalyticsService {
  getDailyInsights(date: DateString): AsyncResult<{
    focusScore: number;
    productivityTrend: 'up' | 'down' | 'stable';
    recommendations: readonly string[];
  }>;
  
  getWeeklyReport(weekStart: DateString): AsyncResult<{
    totalFocusTime: number;
    dailyAverages: Record<DateString, number>;
    trends: Record<string, 'up' | 'down' | 'stable'>;
  }>;
  
  getPersonalBests(): AsyncResult<{
    longestSession: FocusSession;
    mostProductiveDay: DateString;
    currentStreak: number;
  }>;
}