// =====================================
// SIMPLIFIED TYPE EXPORTS
// =====================================

// Export legacy compatibility (main exports for now)
export * from './legacy-compat';

// Re-export models for compatibility
export { FocusCycleModel } from '../models/FocusCycleModel';
export { DailyChecklistModel } from '../models/DailyChecklistModel';
export { TimerModel } from '../models/TimerModel';

// Export component types  
export * from './components';

// Export utility types (selective)
export type { 
  Result, 
  AsyncResult,
  Unsubscribe,
  Subscriber,
  StorageTypeInfo,
  HybridStorageInterface 
} from './utils';