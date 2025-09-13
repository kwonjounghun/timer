import { FocusCycleModel } from '../models/FocusCycleModel';
import { 
  FocusCycleStoreState, 
  FocusCycleData, 
  SubscriberCallback 
} from '../types/index';

export class FocusCycleStore {
  private cyclesByDate: Record<string, FocusCycleModel[]> = {};
  private expandedCycles = new Set<string>();
  private editingCycle: FocusCycleModel | null = null;
  private isLoading: boolean = false;
  private subscribers = new Set<SubscriberCallback<FocusCycleStoreState>>();

  subscribe(callback: SubscriberCallback<FocusCycleStoreState>): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(callback => callback(this.getState()));
  }

  getState(): FocusCycleStoreState {
    return {
      cyclesByDate: { ...this.cyclesByDate },
      expandedCycles: new Set(this.expandedCycles),
      editingCycle: this.editingCycle ? { ...this.editingCycle } : null,
      isLoading: this.isLoading
    };
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.notify();
  }

  setCyclesByDate(cyclesByDate: Record<string, FocusCycleModel[] | FocusCycleData[]>): void {
    this.cyclesByDate = {};
    
    Object.keys(cyclesByDate).forEach(date => {
      this.cyclesByDate[date] = cyclesByDate[date].map(cycleData => 
        cycleData instanceof FocusCycleModel ? cycleData : new FocusCycleModel(cycleData)
      );
    });
    
    this.notify();
  }

  addCycle(date: string, cycleData: Partial<FocusCycleData>): FocusCycleModel {
    const cycle = new FocusCycleModel({ ...cycleData, date } as FocusCycleData);
    
    if (!this.cyclesByDate[date]) {
      this.cyclesByDate[date] = [];
    }
    
    this.cyclesByDate[date].push(cycle);
    this.notify();
    
    return cycle;
  }

  updateCycle(date: string, cycleId: string, updates: Partial<FocusCycleData>): boolean {
    if (!this.cyclesByDate[date]) return false;
    
    const cycleIndex = this.cyclesByDate[date].findIndex(cycle => cycle.id === cycleId);
    if (cycleIndex === -1) return false;
    
    this.cyclesByDate[date][cycleIndex].update(updates);
    this.notify();
    return true;
  }

  deleteCycle(date: string, cycleId: string): boolean {
    if (!this.cyclesByDate[date]) return false;
    
    this.cyclesByDate[date] = this.cyclesByDate[date].filter(cycle => cycle.id !== cycleId);
    this.expandedCycles.delete(cycleId);
    
    if (this.editingCycle && this.editingCycle.id === cycleId) {
      this.editingCycle = null;
    }
    
    this.notify();
    return true;
  }

  toggleExpand(cycleId: string): void {
    if (this.expandedCycles.has(cycleId)) {
      this.expandedCycles.delete(cycleId);
    } else {
      this.expandedCycles.add(cycleId);
    }
    this.notify();
  }

  startEdit(cycle: FocusCycleModel): void {
    this.editingCycle = new FocusCycleModel(cycle.toJSON());
    this.expandedCycles.add(cycle.id);
    this.notify();
  }

  updateEditingCycle(updates: Partial<FocusCycleData>): void {
    if (!this.editingCycle) return;
    
    Object.assign(this.editingCycle, updates);
    this.notify();
  }

  cancelEdit(): void {
    this.editingCycle = null;
    this.notify();
  }

  getCyclesForDate(date: string): FocusCycleModel[] {
    const cycles = this.cyclesByDate[date] || [];
    return [...cycles].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  clearAllCycles(): void {
    this.cyclesByDate = {};
    this.expandedCycles.clear();
    this.editingCycle = null;
    this.notify();
  }
}