import { useState, useEffect, useCallback } from 'react';
import { FocusCycle } from '../domain/types';
import { 
  filterCyclesByDate, 
  sortCyclesByStartTime,
  updateCycleInArray,
  removeCycleFromArray,
  validateCycle
} from '../domain/cycle-manager';
import { firebaseFocusCycleRepository } from '../infrastructure/firebase-repository';

/**
 * 사이클 히스토리 애플리케이션 Hook
 */
export function useCycleHistory(selectedDate: string) {
  const [focusCycles, setFocusCycles] = useState<FocusCycle[]>([]);
  const [expandedCycles, setExpandedCycles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 날짜의 사이클들
  const currentDateCycles = filterCyclesByDate(focusCycles, selectedDate);
  const sortedCycles = sortCyclesByStartTime(currentDateCycles, 'asc');

  /**
   * 사이클 펼치기/접기 토글
   */
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

  /**
   * 새 사이클 추가
   */
  const addCycle = useCallback((cycle: FocusCycle) => {
    setFocusCycles(prev => [...prev, cycle]);
  }, []);

  /**
   * 사이클 업데이트
   */
  const updateCycle = useCallback(async (cycleId: string, updates: Partial<FocusCycle>) => {
    try {
      setLoading(true);
      setError(null);

      // 유효성 검사
      const validation = validateCycle({ ...focusCycles.find(c => c.id === cycleId)!, ...updates });
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Firebase 업데이트
      await firebaseFocusCycleRepository.updateCycle(cycleId, updates);

      // 로컬 상태 업데이트
      setFocusCycles(prev => updateCycleInArray(prev, cycleId, updates));

      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('cycleUpdated', { detail: { cycleId, updates } }));

    } catch (error) {
      console.error('사이클 업데이트 실패:', error);
      setError(error instanceof Error ? error.message : '사이클 업데이트에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [focusCycles]);

  /**
   * 사이클 삭제
   */
  const deleteCycle = useCallback(async (cycleId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Firebase 삭제
      await firebaseFocusCycleRepository.deleteCycle(cycleId);

      // 로컬 상태 업데이트
      setFocusCycles(prev => removeCycleFromArray(prev, cycleId));

      // 펼쳐진 사이클에서 제거
      setExpandedCycles(prev => {
        const newSet = new Set(prev);
        newSet.delete(cycleId);
        return newSet;
      });

      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('cycleDeleted', { detail: { cycleId } }));

    } catch (error) {
      console.error('사이클 삭제 실패:', error);
      setError(error instanceof Error ? error.message : '사이클 삭제에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 모든 사이클 로드
   */
  const loadAllCycles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cycles = await firebaseFocusCycleRepository.getAllCycles();
      setFocusCycles(cycles);

    } catch (error) {
      console.error('사이클 로드 실패:', error);
      setError(error instanceof Error ? error.message : '사이클 로드를 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 특정 날짜의 사이클 로드
   */
  const loadCyclesByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const cycles = await firebaseFocusCycleRepository.getCyclesByDate(date);
      
      // 기존 사이클에서 해당 날짜 제거 후 새 사이클 추가
      setFocusCycles(prev => {
        const filtered = prev.filter(cycle => cycle.date !== date);
        return [...filtered, ...cycles];
      });

    } catch (error) {
      console.error('날짜별 사이클 로드 실패:', error);
      setError(error instanceof Error ? error.message : '날짜별 사이클 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 사이클 새로고침
   */
  const refreshCycles = useCallback(async () => {
    await loadAllCycles();
  }, [loadAllCycles]);

  /**
   * 초기 로드
   */
  useEffect(() => {
    loadAllCycles();
  }, [loadAllCycles]);

  /**
   * 커스텀 이벤트 리스너 등록
   */
  useEffect(() => {
    const handleCycleAdded = (event: CustomEvent) => {
      const cycle = event.detail;
      addCycle(cycle);
    };

    const handleCycleUpdated = (event: CustomEvent) => {
      const { cycleId, updates } = event.detail;
      setFocusCycles(prev => updateCycleInArray(prev, cycleId, updates));
    };

    const handleCycleDeleted = (event: CustomEvent) => {
      const { cycleId } = event.detail;
      setFocusCycles(prev => removeCycleFromArray(prev, cycleId));
    };

    window.addEventListener('cycleAdded', handleCycleAdded as EventListener);
    window.addEventListener('cycleUpdated', handleCycleUpdated as EventListener);
    window.addEventListener('cycleDeleted', handleCycleDeleted as EventListener);

    return () => {
      window.removeEventListener('cycleAdded', handleCycleAdded as EventListener);
      window.removeEventListener('cycleUpdated', handleCycleUpdated as EventListener);
      window.removeEventListener('cycleDeleted', handleCycleDeleted as EventListener);
    };
  }, [addCycle]);

  return {
    // 상태
    focusCycles,
    sortedCycles,
    expandedCycles,
    loading,
    error,

    // 액션
    toggleExpand,
    addCycle,
    updateCycle,
    deleteCycle,
    loadCyclesByDate,
    refreshCycles,

    // 유틸리티
    getCycleById: (id: string) => focusCycles.find(cycle => cycle.id === id),
    isExpanded: (cycleId: string) => expandedCycles.has(cycleId),
  };
}
