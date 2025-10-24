import { FocusCycle, CycleSortOptions, CycleFilterOptions } from './types';

/**
 * 사이클 관리 순수 함수들
 */

/**
 * 사이클을 날짜별로 필터링
 * @param cycles 사이클 배열
 * @param date 필터링할 날짜 (YYYY-MM-DD 형식)
 * @returns 필터링된 사이클 배열
 */
export function filterCyclesByDate(cycles: FocusCycle[], date: string): FocusCycle[] {
  return cycles.filter(cycle => cycle.date === date);
}

/**
 * 사이클을 날짜 범위로 필터링
 * @param cycles 사이클 배열
 * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
 * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
 * @returns 필터링된 사이클 배열
 */
export function filterCyclesByDateRange(
  cycles: FocusCycle[], 
  startDate: string, 
  endDate: string
): FocusCycle[] {
  return cycles.filter(cycle => {
    return cycle.date >= startDate && cycle.date <= endDate;
  });
}

/**
 * 사이클을 시작 시간으로 정렬
 * @param cycles 사이클 배열
 * @param direction 정렬 방향 ('asc' | 'desc')
 * @returns 정렬된 사이클 배열
 */
export function sortCyclesByStartTime(cycles: FocusCycle[], direction: 'asc' | 'desc' = 'asc'): FocusCycle[] {
  return [...cycles].sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    
    // 유효하지 않은 시간이 있으면 뒤로 정렬
    if (isNaN(aTime) && isNaN(bTime)) return 0;
    if (isNaN(aTime)) return 1;
    if (isNaN(bTime)) return -1;
    
    return direction === 'asc' ? aTime - bTime : bTime - aTime;
  });
}

/**
 * 사이클을 종료 시간으로 정렬
 * @param cycles 사이클 배열
 * @param direction 정렬 방향 ('asc' | 'desc')
 * @returns 정렬된 사이클 배열
 */
export function sortCyclesByEndTime(cycles: FocusCycle[], direction: 'asc' | 'desc' = 'asc'): FocusCycle[] {
  return [...cycles].sort((a, b) => {
    const aTime = new Date(a.endTime).getTime();
    const bTime = new Date(b.endTime).getTime();
    
    // 유효하지 않은 시간이 있으면 뒤로 정렬
    if (isNaN(aTime) && isNaN(bTime)) return 0;
    if (isNaN(aTime)) return 1;
    if (isNaN(bTime)) return -1;
    
    return direction === 'asc' ? aTime - bTime : bTime - aTime;
  });
}

/**
 * 사이클을 소요 시간으로 정렬
 * @param cycles 사이클 배열
 * @param direction 정렬 방향 ('asc' | 'desc')
 * @returns 정렬된 사이클 배열
 */
export function sortCyclesByTimeSpent(cycles: FocusCycle[], direction: 'asc' | 'desc' = 'desc'): FocusCycle[] {
  return [...cycles].sort((a, b) => {
    return direction === 'asc' ? a.timeSpent - b.timeSpent : b.timeSpent - a.timeSpent;
  });
}

/**
 * 사이클을 사용자 정의 옵션으로 정렬
 * @param cycles 사이클 배열
 * @param options 정렬 옵션
 * @returns 정렬된 사이클 배열
 */
export function sortCycles(cycles: FocusCycle[], options: CycleSortOptions): FocusCycle[] {
  switch (options.field) {
    case 'startTime':
      return sortCyclesByStartTime(cycles, options.direction);
    case 'endTime':
      return sortCyclesByEndTime(cycles, options.direction);
    case 'timeSpent':
      return sortCyclesByTimeSpent(cycles, options.direction);
    default:
      return cycles;
  }
}

/**
 * 사이클을 필터링
 * @param cycles 사이클 배열
 * @param options 필터 옵션
 * @returns 필터링된 사이클 배열
 */
export function filterCycles(cycles: FocusCycle[], options: CycleFilterOptions): FocusCycle[] {
  let filtered = [...cycles];
  
  if (options.date) {
    filtered = filterCyclesByDate(filtered, options.date);
  }
  
  if (options.dateRange) {
    filtered = filterCyclesByDateRange(
      filtered, 
      options.dateRange.start, 
      options.dateRange.end
    );
  }
  
  return filtered;
}

/**
 * 사이클을 필터링하고 정렬
 * @param cycles 사이클 배열
 * @param filterOptions 필터 옵션
 * @param sortOptions 정렬 옵션
 * @returns 처리된 사이클 배열
 */
export function processCycles(
  cycles: FocusCycle[],
  filterOptions?: CycleFilterOptions,
  sortOptions?: CycleSortOptions
): FocusCycle[] {
  let processed = [...cycles];
  
  if (filterOptions) {
    processed = filterCycles(processed, filterOptions);
  }
  
  if (sortOptions) {
    processed = sortCycles(processed, sortOptions);
  }
  
  return processed;
}

/**
 * 사이클 통계 계산
 * @param cycles 사이클 배열
 * @returns 통계 정보
 */
export function calculateCycleStats(cycles: FocusCycle[]): {
  totalCycles: number;
  totalTimeSpent: number; // 초 단위
  averageTimeSpent: number; // 초 단위
  longestCycle: FocusCycle | null;
  shortestCycle: FocusCycle | null;
} {
  if (cycles.length === 0) {
    return {
      totalCycles: 0,
      totalTimeSpent: 0,
      averageTimeSpent: 0,
      longestCycle: null,
      shortestCycle: null
    };
  }
  
  const totalTimeSpent = cycles.reduce((sum, cycle) => sum + cycle.timeSpent, 0);
  const averageTimeSpent = totalTimeSpent / cycles.length;
  
  const longestCycle = cycles.reduce((longest, current) => 
    current.timeSpent > longest.timeSpent ? current : longest
  );
  
  const shortestCycle = cycles.reduce((shortest, current) => 
    current.timeSpent < shortest.timeSpent ? current : shortest
  );
  
  return {
    totalCycles: cycles.length,
    totalTimeSpent,
    averageTimeSpent,
    longestCycle,
    shortestCycle
  };
}

/**
 * 날짜별 사이클 통계 계산
 * @param cycles 사이클 배열
 * @param date 날짜 (YYYY-MM-DD 형식)
 * @returns 해당 날짜의 통계 정보
 */
export function calculateDailyStats(cycles: FocusCycle[], date: string): {
  dailyCycles: number;
  dailyTimeSpent: number; // 초 단위
  averageTimeSpent: number; // 초 단위
  firstCycleTime: string | null;
  lastCycleTime: string | null;
} {
  const dailyCycles = filterCyclesByDate(cycles, date);
  
  if (dailyCycles.length === 0) {
    return {
      dailyCycles: 0,
      dailyTimeSpent: 0,
      averageTimeSpent: 0,
      firstCycleTime: null,
      lastCycleTime: null
    };
  }
  
  const dailyTimeSpent = dailyCycles.reduce((sum, cycle) => sum + cycle.timeSpent, 0);
  const averageTimeSpent = dailyTimeSpent / dailyCycles.length;
  
  const sortedByStartTime = sortCyclesByStartTime(dailyCycles, 'asc');
  const firstCycle = sortedByStartTime[0];
  const lastCycle = sortedByStartTime[sortedByStartTime.length - 1];
  
  return {
    dailyCycles: dailyCycles.length,
    dailyTimeSpent,
    averageTimeSpent,
    firstCycleTime: firstCycle ? new Date(firstCycle.startTime).toLocaleTimeString('ko-KR') : null,
    lastCycleTime: lastCycle ? new Date(lastCycle.endTime).toLocaleTimeString('ko-KR') : null
  };
}

/**
 * 사이클 검색
 * @param cycles 사이클 배열
 * @param query 검색 쿼리
 * @returns 검색된 사이클 배열
 */
export function searchCycles(cycles: FocusCycle[], query: string): FocusCycle[] {
  if (!query.trim()) return cycles;
  
  const lowercaseQuery = query.toLowerCase();
  
  return cycles.filter(cycle => 
    cycle.task.toLowerCase().includes(lowercaseQuery) ||
    cycle.result.toLowerCase().includes(lowercaseQuery) ||
    cycle.distractions.toLowerCase().includes(lowercaseQuery) ||
    cycle.thoughts.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * 사이클 유효성 검사
 * @param cycle 검사할 사이클
 * @returns 유효성 검사 결과
 */
export function validateCycle(cycle: FocusCycle): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!cycle.id) {
    errors.push('사이클 ID가 필요합니다.');
  }
  
  if (!cycle.date) {
    errors.push('날짜가 필요합니다.');
  }
  
  if (!cycle.task.trim()) {
    errors.push('작업 내용이 필요합니다.');
  }
  
  if (!cycle.startTime || isNaN(new Date(cycle.startTime).getTime())) {
    errors.push('유효한 시작 시간이 필요합니다.');
  }
  
  if (!cycle.endTime || isNaN(new Date(cycle.endTime).getTime())) {
    errors.push('유효한 종료 시간이 필요합니다.');
  }
  
  if (cycle.timeSpent < 0) {
    errors.push('소요 시간은 음수가 될 수 없습니다.');
  }
  
  if (cycle.startTime && cycle.endTime) {
    const start = new Date(cycle.startTime);
    const end = new Date(cycle.endTime);
    
    if (start >= end) {
      errors.push('시작 시간은 종료 시간보다 빨라야 합니다.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 사이클 업데이트 (불변성 유지)
 * @param cycles 기존 사이클 배열
 * @param id 업데이트할 사이클 ID
 * @param updates 업데이트할 필드들
 * @returns 업데이트된 사이클 배열
 */
export function updateCycleInArray(
  cycles: FocusCycle[],
  id: string,
  updates: Partial<FocusCycle>
): FocusCycle[] {
  return cycles.map(cycle => 
    cycle.id === id ? { ...cycle, ...updates } : cycle
  );
}

/**
 * 사이클 삭제 (불변성 유지)
 * @param cycles 기존 사이클 배열
 * @param id 삭제할 사이클 ID
 * @returns 삭제된 사이클 배열
 */
export function removeCycleFromArray(cycles: FocusCycle[], id: string): FocusCycle[] {
  return cycles.filter(cycle => cycle.id !== id);
}
