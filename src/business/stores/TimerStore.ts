import { TimerModel } from '../models/TimerModel';
import { 
  TimerStoreState, 
  ReflectionData, 
  SubscriberCallback, 
  TimerCompleteCallback 
} from '../types/index';

export class TimerStore {
  private timer: TimerModel;
  private currentTask: string = '';
  private timerStartTime: Date | null = null;
  private timerEndTime: Date | null = null;
  private showTaskInput: boolean = true;
  private showReflection: boolean = false;
  private reflection: {
    result: string;
    distractions: string;
    thoughts: string;
  } = {
    result: '',
    distractions: '',
    thoughts: ''
  };
  private subscribers = new Set<SubscriberCallback<TimerStoreState>>();

  constructor() {
    this.timer = new TimerModel();
  }

  subscribe(callback: SubscriberCallback<TimerStoreState>): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(callback => callback(this.getState()));
  }

  getState(): TimerStoreState {
    return {
      timerState: this.timer.getState(),
      currentTask: this.currentTask,
      timerStartTime: this.timerStartTime,
      timerEndTime: this.timerEndTime,
      showTaskInput: this.showTaskInput,
      showReflection: this.showReflection,
      reflection: { ...this.reflection },
      formattedTime: TimerModel.formatTime(this.timer.getState().timeLeft)
    };
  }

  setCurrentTask(task: string): void {
    this.currentTask = task;
    this.notify();
  }

  setOnTimerComplete(callback: TimerCompleteCallback): void {
    this.timer.setOnCompleteCallback(() => {
      this.timerEndTime = new Date();
      this.showReflection = true;
      this.notify();
      callback();
    });
  }

  startTimer(): boolean {
    if (!this.currentTask.trim()) return false;
    
    this.showTaskInput = false;
    this.timerStartTime = new Date();
    this.timer.start();
    this.notify();
    return true;
  }

  pauseTimer(): void {
    this.timer.pause();
    this.notify();
  }

  stopTimer(): void {
    this.timer.pause();
    this.timerEndTime = new Date();
    this.showReflection = true;
    this.notify();
  }

  updateReflection(field: 'result' | 'distractions' | 'thoughts', value: string): void {
    this.reflection[field] = value;
    this.notify();
  }

  resetToInitialState(): void {
    this.timer.reset();
    this.currentTask = '';
    this.timerStartTime = null;
    this.timerEndTime = null;
    this.showTaskInput = true;
    this.showReflection = false;
    this.reflection.result = '';
    this.reflection.distractions = '';
    this.reflection.thoughts = '';
    this.notify();
  }

  updateTimer(): void {
    if (this.timer.getState().isRunning) {
      this.timer.updateTimer();
      this.notify();
    }
  }

  getCycleData() {
    const timerState = this.timer.getState();
    const actualTimeSpent = Math.max(0, timerState.initialTime - timerState.timeLeft);
    
    return {
      task: this.currentTask,
      startTime: this.timerStartTime || new Date(),
      endTime: this.timerEndTime || new Date(),
      timeSpent: actualTimeSpent,
      result: this.reflection.result,
      distractions: this.reflection.distractions,
      thoughts: this.reflection.thoughts
    };
  }
}