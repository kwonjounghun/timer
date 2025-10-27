/**
 * 타이머 컨텍스트
 * UI에 무관한 공유 상태 관리
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * 타이머 컨텍스트 타입
 */
interface TimerContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
}

/**
 * 타이머 컨텍스트 생성
 */
const TimerContext = createContext<TimerContextType | undefined>(undefined);

/**
 * 타이머 컨텍스트 프로바이더 Props
 */
interface TimerContextProviderProps {
  children: ReactNode;
  initialDate?: string;
}

/**
 * 타이머 컨텍스트 프로바이더
 */
export function TimerContextProvider({ 
  children, 
  initialDate 
}: TimerContextProviderProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );

  /**
   * 오늘로 이동
   */
  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  /**
   * 이전 날짜로 이동
   */
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  /**
   * 다음 날짜로 이동
   */
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const value: TimerContextType = {
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

/**
 * 타이머 컨텍스트 훅
 */
export function useTimerContext(): TimerContextType {
  const context = useContext(TimerContext);
  
  if (context === undefined) {
    throw new Error('useTimerContext는 TimerContextProvider 내에서 사용되어야 합니다.');
  }
  
  return context;
}

/**
 * 날짜 유틸리티 함수들
 */
export const dateUtils = {
  /**
   * 현재 날짜를 YYYY-MM-DD 형식으로 반환
   */
  getToday: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * 날짜를 포맷팅하여 표시용 문자열로 변환
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 날짜 비교를 위해 시간을 제거
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const compareYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const compareTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (compareDate.getTime() === compareToday.getTime()) {
      return '오늘';
    } else if (compareDate.getTime() === compareYesterday.getTime()) {
      return '어제';
    } else if (compareDate.getTime() === compareTomorrow.getTime()) {
      return '내일';
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
  },

  /**
   * 날짜가 오늘인지 확인
   */
  isToday: (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  },

  /**
   * 날짜가 과거인지 확인
   */
  isPast: (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date < today;
  },

  /**
   * 날짜가 미래인지 확인
   */
  isFuture: (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return date > today;
  }
};
