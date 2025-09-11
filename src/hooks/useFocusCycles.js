import { useState, useEffect, useCallback } from 'react';
import { hybridStorage } from '../utils/hybridStorage';
import { getStorageInfo } from '../utils/storageType';

export const useFocusCycles = () => {
  const [cyclesByDate, setCyclesByDate] = useState({});
  const [expandedCycles, setExpandedCycles] = useState(new Set());
  const [editingCycle, setEditingCycle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageType, setStorageType] = useState('localStorage');

  // 스토리지 타입 감지 및 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const storageInfo = getStorageInfo();
        setStorageType(storageInfo.type);
        
        // 모든 사이클 데이터 로드
        const allCycles = await hybridStorage.getAllFocusCycles();
        
        // 날짜별로 그룹화
        const groupedCycles = {};
        allCycles.forEach(cycle => {
          if (!groupedCycles[cycle.date]) {
            groupedCycles[cycle.date] = [];
          }
          
          // Date 객체 변환
          const convertedCycle = {
            ...cycle,
            startTime: cycle.startTime instanceof Date ? cycle.startTime : new Date(cycle.startTime),
            endTime: cycle.endTime instanceof Date ? cycle.endTime : new Date(cycle.endTime)
          };
          
          groupedCycles[cycle.date].push(convertedCycle);
        });
        
        setCyclesByDate(groupedCycles);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setCyclesByDate({});
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addCycle = useCallback(async (cycle) => {
    try {
      const cycleData = {
        ...cycle,
        startTime: new Date(cycle.startTime).toISOString(),
        endTime: new Date(cycle.endTime).toISOString()
      };
      
      const cycleId = await hybridStorage.saveFocusCycle(cycleData);
      
      const newCycle = {
        id: cycleId,
        ...cycle,
        startTime: new Date(cycle.startTime),
        endTime: new Date(cycle.endTime)
      };
      
      setCyclesByDate(prev => ({
        ...prev,
        [cycle.date]: [...(prev[cycle.date] || []), newCycle]
      }));
    } catch (error) {
      console.error('사이클 저장 실패:', error);
    }
  }, []);

  const editCycle = (cycle) => {
    setEditingCycle({...cycle});
    setExpandedCycles(prev => new Set([...prev, cycle.id]));
  };

  const saveEdit = useCallback(async (date) => {
    try {
      const updateData = {
        ...editingCycle,
        startTime: new Date(editingCycle.startTime).toISOString(),
        endTime: new Date(editingCycle.endTime).toISOString()
      };
      
      await hybridStorage.updateFocusCycle(editingCycle.id, updateData);
      
      setCyclesByDate(prev => ({
        ...prev,
        [date]: prev[date].map(cycle => 
          cycle.id === editingCycle.id ? editingCycle : cycle
        )
      }));
      setEditingCycle(null);
    } catch (error) {
      console.error('사이클 업데이트 실패:', error);
    }
  }, [editingCycle]);

  const deleteCycle = useCallback(async (date, id) => {
    try {
      await hybridStorage.deleteFocusCycle(id);
      
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
    } catch (error) {
      console.error('사이클 삭제 실패:', error);
    }
  }, []);

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

  const clearAllData = useCallback(async () => {
    if (window.confirm('모든 집중 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // 모든 사이클 삭제
        const allCycles = await hybridStorage.getAllFocusCycles();
        for (const cycle of allCycles) {
          await hybridStorage.deleteFocusCycle(cycle.id);
        }
        
        setCyclesByDate({});
        setExpandedCycles(new Set());
        setEditingCycle(null);
      } catch (error) {
        console.error('데이터 삭제 실패:', error);
      }
    }
  }, []);

  return {
    cyclesByDate,
    expandedCycles,
    editingCycle,
    isLoading,
    storageType,
    addCycle,
    editCycle,
    saveEdit,
    deleteCycle,
    toggleExpand,
    clearAllData,
    setEditingCycle
  };
};
