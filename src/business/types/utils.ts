// =====================================
// UTILITY TYPE DEFINITIONS
// =====================================

import { 
  DateString, 
  StorageType, 
  StorageConfig, 
  FirebaseConfig 
} from '../domain/index';

// Date Utils Types
export interface DateUtilsFunctions {
  formatDate: (dateString: DateString) => string;
  formatTime: (date: Date | string) => string;
  getTodayString: () => DateString;
  changeDate: (currentDate: DateString, direction: 'prev' | 'next') => DateString;
}

export type DateDirection = 'prev' | 'next';

// Storage Utils Types
export interface StorageTypeInfo {
  readonly type: StorageType;
  readonly isFirebase: boolean;
  readonly isLocalStorage: boolean;
  readonly config: FirebaseConfig | null;
}

export interface StorageUtilsFunctions {
  getStorageType: () => StorageType;
  getStorageInfo: () => StorageTypeInfo;
  hasFirebaseConfig: () => boolean;
}

// Clipboard Utils Types
export interface ClipboardUtilsFunctions {
  copySectionContent: (sectionData: Record<number, string>, sectionTitle: string) => Promise<void>;
  copyToClipboard: (text: string) => Promise<boolean>;
}

// Audio/Notification Types
export interface AudioConfig {
  readonly volume: number;
  readonly enabled: boolean;
  readonly soundUrl?: string;
}

export interface NotificationConfig {
  readonly title: string;
  readonly body: string;
  readonly icon?: string;
  readonly badge?: string;
  readonly tag?: string;
  readonly requireInteraction?: boolean;
  readonly silent?: boolean;
}

// Local Storage Types
export interface LocalStorageHookResult<T> {
  readonly value: T;
  readonly setValue: (value: T | ((prev: T) => T)) => void;
  readonly removeValue: () => void;
}

// Hybrid Storage Interface (for existing storage system)
export interface HybridStorageItem {
  readonly id: string;
  readonly data: any;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface HybridStorageInterface {
  // Focus Cycles
  getAllFocusCycles: () => Promise<HybridStorageItem[]>;
  saveFocusCycle: (cycle: any) => Promise<string>;
  updateFocusCycle: (id: string, cycle: any) => Promise<void>;
  deleteFocusCycle: (id: string) => Promise<void>;
  
  // Daily Checklists  
  getAllDailyChecklists: () => Promise<HybridStorageItem[]>;
  saveDailyChecklist: (checklist: any) => Promise<string>;
  updateDailyChecklist: (id: string, checklist: any) => Promise<void>;
  getDailyChecklistByDate: (date: DateString) => Promise<HybridStorageItem | null>;
  deleteDailyChecklist: (id: string) => Promise<void>;
}

// Error Types
export interface StorageError extends Error {
  readonly code: 'STORAGE_ERROR' | 'NETWORK_ERROR' | 'PERMISSION_ERROR';
  readonly details?: any;
}

export interface ValidationError extends Error {
  readonly code: 'VALIDATION_ERROR';
  readonly field: string;
  readonly value: any;
}

// Result Types (for error handling)
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Async Result Types
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Environment Variables Types
export interface EnvironmentVariables {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly DEV?: boolean;
}

// Helper Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Event Handler Types
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

// Generic Callback Types
export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;
export type ParameterizedCallback<P, R = void> = (param: P) => R;

// Subscription Types
export type Unsubscribe = () => void;
export type Subscriber<T> = (data: T) => void;
export type SubscriptionManager<T> = {
  subscribe: (subscriber: Subscriber<T>) => Unsubscribe;
  unsubscribe: (subscriber: Subscriber<T>) => void;
  notify: (data: T) => void;
  clear: () => void;
};