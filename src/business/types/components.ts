// =====================================
// COMPONENT INTERFACE DEFINITIONS
// =====================================

import React from 'react';
import { 
  DateString, 
  UUID, 
  ChecklistSection, 
  TimerStatus,
  NotificationPermission,
  FocusSessionViewModel,
  ChecklistSectionViewModel,
  ChecklistQuestionViewModel,
  TimerViewModel,
  DailyStatsViewModel
} from '../domain/index';

// Base Component Props
export interface BaseComponentProps {
  readonly className?: string;
  readonly testId?: string;
}

// App Level Props
export interface AppProps extends BaseComponentProps {
  readonly children?: React.ReactNode;
}

export interface AppContextProviderProps {
  readonly children: React.ReactNode;
}

// Timer Component Props
export interface TimerSectionProps extends BaseComponentProps {
  readonly selectedDate: DateString;
}

export interface TimerDisplayProps extends BaseComponentProps {
  readonly timer: TimerViewModel;
  readonly currentTask: string;
  readonly onStart: () => void;
  readonly onPause: () => void;
  readonly onStop: () => void;
  readonly onReset: () => void;
}

export interface TimerControlsProps extends BaseComponentProps {
  readonly status: TimerStatus;
  readonly canStart: boolean;
  readonly canPause: boolean;
  readonly canStop: boolean;
  readonly canReset: boolean;
  readonly onStart: () => void;
  readonly onPause: () => void;
  readonly onStop: () => void;
  readonly onReset: () => void;
}

export interface TaskInputProps extends BaseComponentProps {
  readonly value: string;
  readonly isVisible: boolean;
  readonly onValueChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
  readonly placeholder?: string;
  readonly maxLength?: number;
}

export interface ReflectionFormProps extends BaseComponentProps {
  readonly isVisible: boolean;
  readonly achievements: string;
  readonly distractions: string;
  readonly improvements: string;
  readonly taskName: string;
  readonly onAchievementsChange: (value: string) => void;
  readonly onDistractionsChange: (value: string) => void;
  readonly onImprovementsChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

// Focus Session Component Props
export interface FocusSessionListProps extends BaseComponentProps {
  readonly sessions: readonly FocusSessionViewModel[];
  readonly expandedSessionIds: ReadonlySet<UUID>;
  readonly editingSessionId: UUID | null;
  readonly onToggleExpand: (sessionId: UUID) => void;
  readonly onStartEdit: (sessionId: UUID) => void;
  readonly onSaveEdit: () => void;
  readonly onCancelEdit: () => void;
  readonly onDelete: (sessionId: UUID) => void;
}

export interface FocusSessionItemProps extends BaseComponentProps {
  readonly session: FocusSessionViewModel;
  readonly isExpanded: boolean;
  readonly isEditing: boolean;
  readonly onToggleExpand: () => void;
  readonly onStartEdit: () => void;
  readonly onSaveEdit: () => void;
  readonly onCancelEdit: () => void;
  readonly onDelete: () => void;
  readonly onFieldChange: (field: string, value: string) => void;
}

// Daily Checklist Component Props
export interface DailyChecklistProps extends BaseComponentProps {
  readonly selectedDate: DateString;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
}

export interface ChecklistSectionProps extends BaseComponentProps {
  readonly section: ChecklistSectionViewModel;
  readonly isExpanded: boolean;
  readonly isEditMode: boolean;
  readonly onToggleExpand: () => void;
  readonly onAnswerChange: (questionId: number, answer: string) => void;
}

export interface ChecklistQuestionProps extends BaseComponentProps {
  readonly question: ChecklistQuestionViewModel;
  readonly isEditMode: boolean;
  readonly onAnswerChange: (answer: string) => void;
}

export interface ChecklistControlsProps extends BaseComponentProps {
  readonly isEditMode: boolean;
  readonly onToggleEditMode: () => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
  readonly hasUnsavedChanges: boolean;
}

// Navigation Component Props
export interface DateNavigationProps extends BaseComponentProps {
  readonly selectedDate: DateString;
  readonly availableDates: readonly DateString[];
  readonly onDateChange: (date: DateString) => void;
  readonly onPreviousDate: () => void;
  readonly onNextDate: () => void;
  readonly onToday: () => void;
  readonly statistics: DailyStatsViewModel;
}

export interface DatePickerProps extends BaseComponentProps {
  readonly selectedDate: DateString;
  readonly availableDates: readonly DateString[];
  readonly onDateChange: (date: DateString) => void;
  readonly minDate?: DateString;
  readonly maxDate?: DateString;
}

// Utility Component Props
export interface StorageIndicatorProps extends BaseComponentProps {
  readonly storageType: string;
  readonly isOnline: boolean;
  readonly lastSyncTime?: Date;
  readonly hasUnsavedChanges: boolean;
}

export interface MarkdownRendererProps extends BaseComponentProps {
  readonly content: string;
  readonly maxLength?: number;
  readonly showLineNumbers?: boolean;
  readonly allowHtml?: boolean;
}

export interface NotificationBannerProps extends BaseComponentProps {
  readonly permission: NotificationPermission;
  readonly onRequestPermission: () => void;
  readonly onDismiss: () => void;
}

export interface ProgressBarProps extends BaseComponentProps {
  readonly progress: number; // 0-100
  readonly showPercentage: boolean;
  readonly color?: 'primary' | 'success' | 'warning' | 'danger';
  readonly size?: 'sm' | 'md' | 'lg';
}

export interface StatisticsCardProps extends BaseComponentProps {
  readonly title: string;
  readonly value: string | number;
  readonly subtitle?: string;
  readonly icon?: React.ReactNode;
  readonly trend?: 'up' | 'down' | 'neutral';
  readonly trendValue?: string;
}

// Modal/Dialog Component Props
export interface ModalProps extends BaseComponentProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly closeOnBackdropClick?: boolean;
  readonly closeOnEscape?: boolean;
  readonly children: React.ReactNode;
}

export interface ConfirmDialogProps extends BaseComponentProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly variant?: 'default' | 'danger';
}

// Form Component Props
export interface FormFieldProps extends BaseComponentProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly type?: 'text' | 'email' | 'password' | 'textarea';
  readonly maxLength?: number;
  readonly rows?: number; // for textarea
}

export interface ButtonProps extends BaseComponentProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly icon?: React.ReactNode;
  readonly iconPosition?: 'left' | 'right';
}

// Layout Component Props
export interface ContainerProps extends BaseComponentProps {
  readonly children: React.ReactNode;
  readonly maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  readonly padding?: boolean;
  readonly centerContent?: boolean;
}

export interface GridProps extends BaseComponentProps {
  readonly children: React.ReactNode;
  readonly columns: number | { sm?: number; md?: number; lg?: number; xl?: number };
  readonly gap?: 'sm' | 'md' | 'lg';
  readonly alignItems?: 'start' | 'center' | 'end' | 'stretch';
}

// Event Handler Types for Components
export interface TimerEventHandlers {
  readonly onTaskChange: (task: string) => void;
  readonly onTimerStart: () => void;
  readonly onTimerPause: () => void;
  readonly onTimerStop: () => void;
  readonly onTimerReset: () => void;
  readonly onTimerComplete: () => void;
  readonly onReflectionSubmit: (reflection: {
    achievements: string;
    distractions: string;
    improvements: string;
  }) => void;
}

export interface ChecklistEventHandlers {
  readonly onSectionToggle: (section: ChecklistSection) => void;
  readonly onAnswerUpdate: (section: ChecklistSection, questionId: number, answer: string) => void;
  readonly onEditModeToggle: () => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}

export interface NavigationEventHandlers {
  readonly onDateChange: (date: DateString) => void;
  readonly onDateNavigate: (direction: 'prev' | 'next') => void;
  readonly onTodayNavigate: () => void;
}

// Component State Types
export interface ComponentLoadingState {
  readonly isLoading: boolean;
  readonly error?: string;
  readonly retryCount: number;
}

export interface ComponentValidationState {
  readonly isValid: boolean;
  readonly errors: ReadonlyMap<string, string>;
  readonly touched: ReadonlySet<string>;
}

// Higher-Order Component Types
export interface WithLoadingProps {
  readonly isLoading: boolean;
  readonly error?: string;
  readonly onRetry?: () => void;
}

export interface WithValidationProps {
  readonly validationState: ComponentValidationState;
  readonly onValidationChange: (field: string, error?: string) => void;
}

// Render Props Types
export type RenderProp<T> = (props: T) => React.ReactNode;
export type ChildrenRenderProp<T> = { children: RenderProp<T> };

// Ref Types
export type ComponentRef<T = HTMLElement> = React.RefObject<T>;
export type ForwardedRef<T = HTMLElement> = React.ForwardedRef<T>;