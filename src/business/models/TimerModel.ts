import { TimerState, TimerCompleteCallback } from '../types/index';

export class TimerModel {
  private initialTime: number;
  private timeLeft: number;
  private isRunning: boolean;
  private startTime: number | null;
  private pausedTime: number;
  private onCompleteCallback: TimerCompleteCallback | null;

  constructor(initialTime: number = 10 * 60) {
    this.initialTime = initialTime;
    this.timeLeft = initialTime;
    this.isRunning = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.onCompleteCallback = null;
  }

  setOnCompleteCallback(callback: TimerCompleteCallback): void {
    this.onCompleteCallback = callback;
  }

  private calculateTimeLeft(start: number, paused: number): number {
    if (!start) return this.initialTime;

    const now = Date.now();
    const elapsed = Math.floor((now - start - paused) / 1000);
    const remaining = Math.max(0, this.initialTime - elapsed);

    return remaining;
  }

  updateTimer(): number {
    if (!this.isRunning || !this.startTime) return this.timeLeft;

    const remaining = this.calculateTimeLeft(this.startTime, this.pausedTime);
    this.timeLeft = remaining;

    if (remaining <= 0) {
      this.isRunning = false;
      this.timeLeft = 0;
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }

    return this.timeLeft;
  }

  start(): this {
    const now = Date.now();

    if (!this.startTime) {
      this.startTime = now;
      this.pausedTime = 0;
    } else {
      const pausedDuration = now - (this.startTime + this.pausedTime + (this.initialTime - this.timeLeft) * 1000);
      this.pausedTime += pausedDuration;
    }

    this.isRunning = true;
    return this;
  }

  pause(): this {
    this.isRunning = false;
    return this;
  }

  reset(): this {
    this.isRunning = false;
    this.timeLeft = this.initialTime;
    this.startTime = null;
    this.pausedTime = 0;
    return this;
  }

  getState(): TimerState {
    return {
      timeLeft: this.timeLeft,
      isRunning: this.isRunning,
      initialTime: this.initialTime
    };
  }

  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}