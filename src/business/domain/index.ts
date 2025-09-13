// =====================================
// CORE DOMAIN MODELS - Type Safe Design
// =====================================

// Base Types
export type UUID = string;
export type DateString = string; // YYYY-MM-DD format
export type ISODateString = string; // ISO 8601 format
export type Seconds = number;
export type Milliseconds = number;

// Enums and Union Types
export type ChecklistSection = 'morning' | 'lunch' | 'evening';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type NotificationPermission = 'granted' | 'denied' | 'default';
export type StorageType = 'localStorage' | 'firebase';

// Value Objects
export interface TimeRange {
  readonly startTime: Date;
  readonly endTime: Date;
}

export interface TimeDuration {
  readonly seconds: Seconds;
  readonly minutes: number;
  readonly hours: number;
}

export interface StorageConfig {
  readonly type: StorageType;
  readonly isOnline: boolean;
  readonly config?: FirebaseConfig;
}

export interface FirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
}

// Domain Entities
export interface Timer {
  readonly id: UUID;
  readonly initialDurationSeconds: Seconds;
  readonly currentTimeLeft: Seconds;
  readonly status: TimerStatus;
  readonly startedAt?: Date;
  readonly pausedAt?: Date;
  readonly completedAt?: Date;
  readonly totalPausedDuration: Milliseconds;
}

export interface TaskDescription {
  readonly content: string;
  readonly isValid: boolean;
}

export interface Reflection {
  readonly achievements: string;
  readonly distractions: string;
  readonly improvements: string;
  readonly learnings?: string;
}

export interface FocusSession {
  readonly id: UUID;
  readonly date: DateString;
  readonly task: TaskDescription;
  readonly timeRange: TimeRange;
  readonly actualDuration: Seconds;
  readonly targetDuration: Seconds;
  readonly reflection: Reflection;
  readonly isCompleted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ChecklistQuestion {
  readonly id: number;
  readonly text: string;
  readonly section: ChecklistSection;
}

export interface ChecklistAnswer {
  readonly questionId: number;
  readonly answer: string;
  readonly answeredAt: Date;
}

export interface ChecklistSection_Model {
  readonly section: ChecklistSection;
  readonly title: string;
  readonly questions: readonly ChecklistQuestion[];
  readonly answers: ReadonlyMap<number, ChecklistAnswer>;
  readonly isCompleted: boolean;
  readonly completionPercentage: number;
}

export interface DailyChecklist {
  readonly id: UUID;
  readonly date: DateString;
  readonly sections: ReadonlyMap<ChecklistSection, ChecklistSection_Model>;
  readonly overallCompletion: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Aggregates
export interface DailyFocusRecord {
  readonly date: DateString;
  readonly focusSessions: readonly FocusSession[];
  readonly dailyChecklist?: DailyChecklist;
  readonly totalFocusTime: Seconds;
  readonly sessionCount: number;
  readonly averageSessionDuration: Seconds;
  readonly productivityScore: number;
}

// View Models for UI
export interface TimerViewModel {
  readonly formattedTime: string;
  readonly progress: number; // 0-100
  readonly status: TimerStatus;
  readonly canStart: boolean;
  readonly canPause: boolean;
  readonly canStop: boolean;
  readonly canReset: boolean;
}

export interface FocusSessionViewModel {
  readonly id: UUID;
  readonly taskSummary: string;
  readonly formattedDuration: string;
  readonly formattedTimeRange: string;
  readonly date: DateString;
  readonly isExpanded: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
}

export interface ChecklistSectionViewModel {
  readonly section: ChecklistSection;
  readonly title: string;
  readonly isExpanded: boolean;
  readonly completionPercentage: number;
  readonly questions: readonly ChecklistQuestionViewModel[];
}

export interface ChecklistQuestionViewModel {
  readonly id: number;
  readonly text: string;
  readonly answer: string;
  readonly isAnswered: boolean;
  readonly canEdit: boolean;
}

export interface DailyStatsViewModel {
  readonly date: DateString;
  readonly totalSessions: number;
  readonly totalFocusTime: string;
  readonly averageSessionTime: string;
  readonly checklistCompletion: number;
  readonly productivityScore: number;
}

// Events
export interface DomainEvent {
  readonly id: UUID;
  readonly occurredAt: Date;
  readonly aggregateId: UUID;
  readonly version: number;
}

export interface TimerStartedEvent extends DomainEvent {
  readonly type: 'TimerStarted';
  readonly task: TaskDescription;
  readonly duration: Seconds;
}

export interface TimerCompletedEvent extends DomainEvent {
  readonly type: 'TimerCompleted';
  readonly actualDuration: Seconds;
  readonly task: TaskDescription;
}

export interface FocusSessionCreatedEvent extends DomainEvent {
  readonly type: 'FocusSessionCreated';
  readonly session: FocusSession;
}

export interface ChecklistAnswerUpdatedEvent extends DomainEvent {
  readonly type: 'ChecklistAnswerUpdated';
  readonly section: ChecklistSection;
  readonly questionId: number;
  readonly answer: string;
}

// Commands
export interface Command {
  readonly type: string;
  readonly id: UUID;
  readonly timestamp: Date;
}

export interface StartTimerCommand extends Command {
  readonly type: 'StartTimer';
  readonly task: TaskDescription;
  readonly duration: Seconds;
}

export interface PauseTimerCommand extends Command {
  readonly type: 'PauseTimer';
}

export interface CompleteTimerCommand extends Command {
  readonly type: 'CompleteTimer';
}

export interface CreateFocusSessionCommand extends Command {
  readonly type: 'CreateFocusSession';
  readonly task: TaskDescription;
  readonly timeRange: TimeRange;
  readonly reflection: Reflection;
}

export interface UpdateChecklistAnswerCommand extends Command {
  readonly type: 'UpdateChecklistAnswer';
  readonly date: DateString;
  readonly section: ChecklistSection;
  readonly questionId: number;
  readonly answer: string;
}