import { hybridStorage } from '../../utils/hybridStorage';
import { FocusCycleModel } from '../models/FocusCycleModel';
import { FocusCycleData, DailyStats } from '../types/index';

export class FocusCycleService {
  private storage = hybridStorage;

  async loadAllCycles(): Promise<Record<string, FocusCycleModel[]>> {
    try {
      const allCycles = await this.storage.getAllFocusCycles();
      
      const groupedCycles: Record<string, FocusCycleModel[]> = {};
      allCycles.forEach((cycleData: any) => {
        const cycle = new FocusCycleModel(cycleData);
        
        if (!groupedCycles[cycle.date]) {
          groupedCycles[cycle.date] = [];
        }
        
        groupedCycles[cycle.date].push(cycle);
      });
      
      return groupedCycles;
    } catch (error) {
      console.error('Failed to load focus cycles:', error);
      return {};
    }
  }

  async saveCycle(cycleData: Partial<FocusCycleData>): Promise<FocusCycleModel> {
    try {
      const cycle = new FocusCycleModel(cycleData as FocusCycleData);
      const savedData = await this.storage.saveFocusCycle(cycle.toJSON());
      
      // Update cycle with saved ID if returned
      if (typeof savedData === 'string') {
        (cycle as any).id = savedData;
      }
      
      return cycle;
    } catch (error) {
      console.error('Failed to save focus cycle:', error);
      throw error;
    }
  }

  async updateCycle(cycle: FocusCycleModel | FocusCycleData): Promise<boolean> {
    try {
      const updateData = cycle instanceof FocusCycleModel ? cycle.toJSON() : cycle;
      await this.storage.updateFocusCycle(updateData.id!, updateData);
      return true;
    } catch (error) {
      console.error('Failed to update focus cycle:', error);
      throw error;
    }
  }

  async deleteCycle(cycleId: string): Promise<boolean> {
    try {
      await this.storage.deleteFocusCycle(cycleId);
      return true;
    } catch (error) {
      console.error('Failed to delete focus cycle:', error);
      throw error;
    }
  }

  async deleteAllCycles(): Promise<boolean> {
    try {
      const allCycles = await this.storage.getAllFocusCycles();
      
      for (const cycle of allCycles) {
        await this.storage.deleteFocusCycle(cycle.id!);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete all cycles:', error);
      throw error;
    }
  }

  getCyclesForDate(cyclesByDate: Record<string, FocusCycleModel[]>, date: string): FocusCycleModel[] {
    const cycles = cyclesByDate[date] || [];
    return [...cycles].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  calculateDailyStats(cycles: FocusCycleModel[]): DailyStats {
    const totalTime = cycles.reduce((sum, cycle) => sum + cycle.timeSpent, 0);
    const totalCycles = cycles.length;
    const averageTime = totalCycles > 0 ? totalTime / totalCycles : 0;
    
    return {
      totalTime,
      totalCycles,
      averageTime,
      formattedTotalTime: this.formatDuration(totalTime),
      formattedAverageTime: this.formatDuration(averageTime)
    };
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    } else {
      return `${remainingSeconds}초`;
    }
  }
}