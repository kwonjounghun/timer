import { useState, useEffect, useCallback } from 'react';

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
  const updateCycle = useCallback((cycleId: string, updates: Partial<FocusCycle>) => {
    setFocusCycles(prev => {
      const updated = prev.map(cycle =>
        cycle.id === cycleId ? { ...cycle, ...updates } : cycle
      );
      // Save to localStorage immediately
      localStorage.setItem('focusCycles', JSON.stringify(updated));
      // Dispatch custom event for DateNavigation to update
      window.dispatchEvent(new CustomEvent('cycleUpdated', { detail: { cycleId, updates } }));
      return updated;
    });
  }, []);

  // Delete cycle
  const deleteCycle = useCallback((cycleId: string) => {
    setFocusCycles(prev => {
      const filtered = prev.filter(cycle => cycle.id !== cycleId);
      // Save to localStorage immediately
      localStorage.setItem('focusCycles', JSON.stringify(filtered));
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

  // Load data from localStorage on mount only
  useEffect(() => {
    const saved = localStorage.getItem('focusCycles');
    if (saved) {
      try {
        const parsedCycles = JSON.parse(saved).map((cycle: any) => ({
          ...cycle,
          startTime: new Date(cycle.startTime),
          endTime: new Date(cycle.endTime),
        }));
        setFocusCycles(parsedCycles);
      } catch (error) {
        console.error('Failed to parse focus cycles:', error);
      }
    }
  }, []); // 컴포넌트 마운트 시에만 로드

  // Save data to localStorage when it changes (only if not empty)
  useEffect(() => {
    if (focusCycles.length > 0) {
      localStorage.setItem('focusCycles', JSON.stringify(focusCycles));
    }
  }, [focusCycles]);

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
