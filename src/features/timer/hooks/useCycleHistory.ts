import { useState, useEffect, useCallback } from 'react';
import { hybridStorage } from '../../../utils/hybridStorage';

export interface FocusCycle {
  id: string;
  date: string;
  task: string;
  startTime: Date;
  endTime: Date;
  timeSpent: number;
  result: string;
  distractions: string;
  thoughts: string;
}

export interface CycleHistory {
  focusCycles: FocusCycle[];
  expandedCycles: Set<string>;
  sortedCycles: FocusCycle[];
  toggleExpand: (cycleId: string) => void;
  addCycle: (cycle: FocusCycle) => void;
  updateCycle: (cycleId: string, updates: Partial<FocusCycle>) => void;
  deleteCycle: (cycleId: string) => void;
}

export const useCycleHistory = (selectedDate: string): CycleHistory => {
  const [focusCycles, setFocusCycles] = useState<FocusCycle[]>([]);
  const [expandedCycles, setExpandedCycles] = useState<Set<string>>(new Set());

  // Get cycles for current date
  const currentDateCycles = focusCycles.filter(cycle => cycle.date === selectedDate);
  const sortedCycles = [...currentDateCycles].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Toggle cycle expansion
  const toggleExpand = useCallback((cycleId: string) => {
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cycleId)) {
        newSet.delete(cycleId);
      } else {
        newSet.add(cycleId);
      }
      return newSet;
    });
  }, []);

  // Add new cycle
  const addCycle = useCallback((cycle: FocusCycle) => {
    setFocusCycles(prev => [...prev, cycle]);
  }, []);

  // Update existing cycle
  const updateCycle = useCallback(async (cycleId: string, updates: Partial<FocusCycle>) => {
    setFocusCycles(prev => {
      const updated = prev.map(cycle =>
        cycle.id === cycleId ? { ...cycle, ...updates } : cycle
      );
      // Save using hybrid storage
      hybridStorage.updateFocusCycle(cycleId, updates).catch(error => {
        console.error('포커스 사이클 업데이트 실패:', error);
      });
      // Dispatch custom event for DateNavigation to update
      window.dispatchEvent(new CustomEvent('cycleUpdated', { detail: { cycleId, updates } }));
      return updated;
    });
  }, []);

  // Delete cycle
  const deleteCycle = useCallback(async (cycleId: string) => {
    setFocusCycles(prev => {
      const filtered = prev.filter(cycle => cycle.id !== cycleId);
      // Save using hybrid storage
      hybridStorage.deleteFocusCycle(cycleId).catch(error => {
        console.error('포커스 사이클 삭제 실패:', error);
      });
      // Dispatch custom event for DateNavigation to update
      window.dispatchEvent(new CustomEvent('cycleDeleted', { detail: { cycleId } }));
      return filtered;
    });
    // Remove from expanded cycles if it was expanded
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      newSet.delete(cycleId);
      return newSet;
    });
  }, []);

  // Load data from hybrid storage on mount only
  useEffect(() => {
    const loadCycles = async () => {
      try {
        const cycles = await hybridStorage.getAllFocusCycles();
        const parsedCycles = cycles.map((cycle: any) => ({
          ...cycle,
          startTime: new Date(cycle.startTime),
          endTime: new Date(cycle.endTime),
        }));
        setFocusCycles(parsedCycles);
      } catch (error) {
        console.error('Failed to load focus cycles:', error);
      }
    };

    loadCycles();
  }, []); // 컴포넌트 마운트 시에만 로드

  // Remove the automatic save effect since we're using hybrid storage for individual operations

  return {
    focusCycles,
    expandedCycles,
    sortedCycles,
    toggleExpand,
    addCycle,
    updateCycle,
    deleteCycle,
  };
};
