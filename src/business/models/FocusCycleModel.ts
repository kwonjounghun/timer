import { FocusCycleData } from '../types/index';

export class FocusCycleModel {
  public readonly id: string;
  public date: string;
  public task: string;
  public startTime: Date;
  public endTime: Date;
  public timeSpent: number;
  public result: string;
  public distractions: string;
  public thoughts: string;

  constructor({
    id,
    date,
    task,
    startTime,
    endTime,
    timeSpent,
    result = '',
    distractions = '',
    thoughts = ''
  }: FocusCycleData) {
    this.id = id || this.generateId();
    this.date = date;
    this.task = task;
    this.startTime = startTime instanceof Date ? startTime : new Date(startTime);
    this.endTime = endTime instanceof Date ? endTime : new Date(endTime);
    this.timeSpent = timeSpent;
    this.result = result;
    this.distractions = distractions;
    this.thoughts = thoughts;
  }

  private generateId(): string {
    return `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  update(updates: Partial<Omit<FocusCycleData, 'id'>>): this {
    Object.assign(this, updates);
    
    // Ensure dates are Date objects
    if (updates.startTime) {
      this.startTime = updates.startTime instanceof Date ? updates.startTime : new Date(updates.startTime);
    }
    if (updates.endTime) {
      this.endTime = updates.endTime instanceof Date ? updates.endTime : new Date(updates.endTime);
    }
    
    return this;
  }

  toJSON(): FocusCycleData {
    return {
      id: this.id,
      date: this.date,
      task: this.task,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      timeSpent: this.timeSpent,
      result: this.result,
      distractions: this.distractions,
      thoughts: this.thoughts
    };
  }

  static fromJSON(json: FocusCycleData): FocusCycleModel {
    return new FocusCycleModel(json);
  }

  getFormattedDuration(): string {
    const minutes = Math.floor(this.timeSpent / 60);
    const seconds = this.timeSpent % 60;
    return `${minutes}분 ${seconds}초`;
  }

  getFormattedTimeRange(): string {
    const formatTime = (date: Date): string => date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    return `${formatTime(this.startTime)} - ${formatTime(this.endTime)}`;
  }
}