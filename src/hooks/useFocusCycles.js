import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useFocusCycles = () => {
  const [cyclesByDate, setCyclesByDate] = useLocalStorage('focusTimerCycles', {});
  const [expandedCycles, setExpandedCycles] = useState(new Set());
  const [editingCycle, setEditingCycle] = useState(null);

  // Date 객체 변환을 위한 useEffect
  useEffect(() => {
    if (Object.keys(cyclesByDate).length > 0) {
      const needsConversion = Object.values(cyclesByDate).some(cycles => 
        cycles.some(cycle => 
          !(cycle.startTime instanceof Date) || !(cycle.endTime instanceof Date)
        )
      );
      
      if (needsConversion) {
        const convertedCycles = {};
        Object.keys(cyclesByDate).forEach(date => {
          convertedCycles[date] = cyclesByDate[date].map(cycle => ({
            ...cycle,
            startTime: cycle.startTime instanceof Date ? cycle.startTime : new Date(cycle.startTime),
            endTime: cycle.endTime instanceof Date ? cycle.endTime : new Date(cycle.endTime)
          }));
        });
        setCyclesByDate(convertedCycles);
      }
    }
  }, [cyclesByDate, setCyclesByDate]);

  const addCycle = (cycle) => {
    const newCycle = {
      id: Date.now(),
      ...cycle,
      startTime: new Date(cycle.startTime),
      endTime: new Date(cycle.endTime)
    };
    
    setCyclesByDate(prev => ({
      ...prev,
      [cycle.date]: [...(prev[cycle.date] || []), newCycle]
    }));
  };

  const editCycle = (cycle) => {
    setEditingCycle({...cycle});
    setExpandedCycles(prev => new Set([...prev, cycle.id]));
  };

  const saveEdit = (date) => {
    setCyclesByDate(prev => ({
      ...prev,
      [date]: prev[date].map(cycle => 
        cycle.id === editingCycle.id ? editingCycle : cycle
      )
    }));
    setEditingCycle(null);
  };

  const deleteCycle = (date, id) => {
    setCyclesByDate(prev => ({
      ...prev,
      [date]: prev[date].filter(cycle => cycle.id !== id)
    }));
    setEditingCycle(null);
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleExpand = (id) => {
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearAllData = () => {
    if (window.confirm('모든 집중 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setCyclesByDate({});
      setExpandedCycles(new Set());
      setEditingCycle(null);
    }
  };

  return {
    cyclesByDate,
    expandedCycles,
    editingCycle,
    addCycle,
    editCycle,
    saveEdit,
    deleteCycle,
    toggleExpand,
    clearAllData,
    setEditingCycle
  };
};
