/**
 * 타이머 세션 훅
 * UI 독립적인 세션 관리 및 CRUD 작업 제공
 */

import { useState, useCallback, useEffect } from 'react';
import { TimerSession, SessionFilter, SessionSort } from '../../domain/types';
import { ISessionRepository } from '../../domain/repositories';
import { 
  filterSessionsByDate,
  sortSessionsByStartTime,
  updateSessionInArray,
  removeSessionFromArray,
  validateSession
} from '../../domain/session-manager';

/**
 * 세션 훅 반환 타입
 */
export interface UseTimerSessionsReturn {
  // 원시 데이터
  sessions: TimerSession[];
  
  // 액션
  actions: {
    loadByDate: (date: string) => Promise<void>;
    loadAll: () => Promise<void>;
    create: (session: TimerSession) => Promise<string>;
    update: (id: string, updates: Partial<Omit<TimerSession, 'id'>>) => Promise<void>;
    delete: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
  };
  
  // 상태
  loading: boolean;
  error: string | null;
  
  // 유틸리티
  computed: {
    byDate: (date: string) => TimerSession[];
    sortedByTime: (sessions: TimerSession[]) => TimerSession[];
    totalTime: (sessions: TimerSession[]) => number;
  };
}

/**
 * 세션 훅 Props
 */
interface UseTimerSessionsProps {
  sessionRepository: ISessionRepository;
  initialDate?: string;
}

/**
 * 타이머 세션 훅
 */
export function useTimerSessions({ 
  sessionRepository, 
  initialDate 
}: UseTimerSessionsProps): UseTimerSessionsReturn {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 특정 날짜의 세션들 로드
   */
  const loadByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      clearError();

      const dateSessions = await sessionRepository.getSessionsByDate(date);
      
      // 기존 세션에서 해당 날짜 제거 후 새 세션 추가
      setSessions(prev => {
        const filtered = prev.filter(session => session.date !== date);
        return [...filtered, ...dateSessions];
      });

    } catch (error) {
      console.error('날짜별 세션 로드 실패:', error);
      setError(error instanceof Error ? error.message : '날짜별 세션 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [sessionRepository, clearError]);

  /**
   * 모든 세션 로드
   */
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const allSessions = await sessionRepository.getAllSessions();
      setSessions(allSessions);

    } catch (error) {
      console.error('전체 세션 로드 실패:', error);
      setError(error instanceof Error ? error.message : '전체 세션 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [sessionRepository, clearError]);

  /**
   * 세션 생성
   */
  const create = useCallback(async (session: TimerSession) => {
    try {
      setLoading(true);
      clearError();

      // 유효성 검사
      const validation = validateSession(session);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const sessionId = await sessionRepository.saveSession(session);
      
      // 로컬 상태 업데이트
      const newSession = { ...session, id: sessionId };
      setSessions(prev => [...prev, newSession]);

      return sessionId;

    } catch (error) {
      console.error('세션 생성 실패:', error);
      setError(error instanceof Error ? error.message : '세션 생성에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionRepository, clearError]);

  /**
   * 세션 업데이트
   */
  const update = useCallback(async (id: string, updates: Partial<Omit<TimerSession, 'id'>>) => {
    try {
      setLoading(true);
      clearError();

      // 유효성 검사
      const existingSession = sessions.find(s => s.id === id);
      if (!existingSession) {
        throw new Error('세션을 찾을 수 없습니다.');
      }

      const updatedSession = { ...existingSession, ...updates };
      const validation = validateSession(updatedSession);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      await sessionRepository.updateSession(id, updates);

      // 로컬 상태 업데이트
      setSessions(prev => updateSessionInArray(prev, id, updates));

    } catch (error) {
      console.error('세션 업데이트 실패:', error);
      setError(error instanceof Error ? error.message : '세션 업데이트에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessions, sessionRepository, clearError]);

  /**
   * 세션 삭제
   */
  const deleteSession = useCallback(async (id: string) => {
    try {
      setLoading(true);
      clearError();

      await sessionRepository.deleteSession(id);

      // 로컬 상태 업데이트
      setSessions(prev => removeSessionFromArray(prev, id));

    } catch (error) {
      console.error('세션 삭제 실패:', error);
      setError(error instanceof Error ? error.message : '세션 삭제에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionRepository, clearError]);

  /**
   * 세션 새로고침
   */
  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  /**
   * 초기 로드
   */
  useEffect(() => {
    if (initialDate) {
      loadByDate(initialDate);
    } else {
      loadAll();
    }
  }, [initialDate, loadByDate, loadAll]);

  /**
   * 날짜별 세션 필터링
   */
  const byDate = useCallback((date: string) => {
    return filterSessionsByDate(sessions, date);
  }, [sessions]);

  /**
   * 시간순 정렬
   */
  const sortedByTime = useCallback((sessionList: TimerSession[]) => {
    return sortSessionsByStartTime(sessionList, 'asc');
  }, []);

  /**
   * 총 시간 계산
   */
  const totalTime = useCallback((sessionList: TimerSession[]) => {
    return sessionList.reduce((sum, session) => sum + session.duration, 0);
  }, []);

  return {
    // 원시 데이터
    sessions,
    
    // 액션
    actions: {
      loadByDate,
      loadAll,
      create,
      update,
      delete: deleteSession,
      refresh
    },
    
    // 상태
    loading,
    error,
    
    // 유틸리티
    computed: {
      byDate,
      sortedByTime,
      totalTime
    }
  };
}
