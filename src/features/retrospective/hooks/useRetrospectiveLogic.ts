import { useState, useEffect, useCallback } from 'react';
import { hybridStorage } from '../../../utils/hybridStorage';
import type { DailyRetrospective, ReflectionItem, ActionItem, PreviousGoalCheck } from '../../../types/retrospective';

export interface RetrospectiveLogic {
  // 현재 회고 데이터
  currentRetrospective: DailyRetrospective | null;

  // 상태
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // 회고 관리
  loadRetrospective: (date: string) => Promise<void>;
  saveRetrospective: () => Promise<void>;

  // 기본 정보 업데이트
  updateDailyJournal: (content: string) => void;
  updateTags: (tags: string[]) => void;

  // 이전 목표 점검
  updatePreviousGoalCheck: (content: string) => void;

  // 회고 항목 관리
  addReflection: (content: string, goodPoints: string, improvePoints: string) => void;
  updateReflection: (id: string, content: string, goodPoints: string, improvePoints: string) => void;
  deleteReflection: (id: string) => void;

  // 액션 아이템 관리
  addActionItem: (description: string) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (id: string) => void;
  toggleActionItemCompletion: (id: string) => void;

  // 이전 회고에서 액션 아이템 불러오기
  loadPreviousActions: (previousDate: string) => Promise<ActionItem[]>;

  // 통계
  getStats: () => {
    reflectionCount: number;
    actionCount: number;
    completedActionCount: number;
  };
}

export const useRetrospectiveLogic = (): RetrospectiveLogic => {
  const [currentRetrospective, setCurrentRetrospective] = useState<DailyRetrospective | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 회고 로드
  const loadRetrospective = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const retrospective = await hybridStorage.getRetrospectiveByDate(date);

      if (retrospective) {
        // 기존 회고가 있으면 로드
        setCurrentRetrospective({
          ...retrospective,
          createdAt: new Date(retrospective.createdAt),
          updatedAt: new Date(retrospective.updatedAt),
          reflections: retrospective.reflections.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          })),
          nextActions: retrospective.nextActions.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          }))
        });
      } else {
        // 새 회고 템플릿 생성
        const newRetrospective: DailyRetrospective = {
          id: `temp_${Date.now()}`,
          date,
          createdAt: new Date(),
          updatedAt: new Date(),
          dailyJournal: {
            content: ''
          },
          reflections: [],
          nextActions: [],
          tags: []
        };
        setCurrentRetrospective(newRetrospective);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('회고 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 회고 저장
  const saveRetrospective = useCallback(async () => {
    if (!currentRetrospective) return;

    setIsSaving(true);
    try {
      // 임시 ID로 생성된 경우 실제 ID로 업데이트
      if (currentRetrospective.id && currentRetrospective.id.startsWith('temp_')) {
        const actualId = await hybridStorage.saveRetrospective({
          ...currentRetrospective,
          id: undefined // 새로 생성하도록
        });

        setCurrentRetrospective(prev => prev ? {
          ...prev,
          id: actualId,
          updatedAt: new Date()
        } : null);
      } else {
        // 기존 회고 업데이트
        await hybridStorage.updateRetrospective(currentRetrospective.id, {
          ...currentRetrospective,
          updatedAt: new Date()
        });

        setCurrentRetrospective(prev => prev ? {
          ...prev,
          updatedAt: new Date()
        } : null);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('회고 저장 실패:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentRetrospective]);

  // 변경사항 표시용 헬퍼
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // 일일 기록 업데이트
  const updateDailyJournal = useCallback((content: string) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      dailyJournal: {
        content
      }
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 태그 업데이트
  const updateTags = useCallback((tags: string[]) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      tags
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 이전 목표 점검 업데이트
  const updatePreviousGoalCheck = useCallback((content: string) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      previousGoalCheck: { content }
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 회고 항목 추가
  const addReflection = useCallback((content: string, goodPoints: string, improvePoints: string) => {
    if (!content.trim()) return;

    const newReflection: ReflectionItem = {
      id: `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      goodPoints: goodPoints.trim(),
      improvePoints: improvePoints.trim(),
      createdAt: new Date()
    };

    setCurrentRetrospective(prev => prev ? {
      ...prev,
      reflections: [...prev.reflections, newReflection]
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 회고 항목 수정
  const updateReflection = useCallback((id: string, content: string, goodPoints: string, improvePoints: string) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      reflections: prev.reflections.map(item =>
        item.id === id ? {
          ...item,
          content: content.trim(),
          goodPoints: goodPoints.trim(),
          improvePoints: improvePoints.trim()
        } : item
      )
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 회고 항목 삭제
  const deleteReflection = useCallback((id: string) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      reflections: prev.reflections.filter(item => item.id !== id)
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 액션 아이템 추가
  const addActionItem = useCallback((description: string) => {
    if (!description.trim()) return;

    const newActionItem: ActionItem = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: description.trim(),
      completed: false,
      createdAt: new Date()
    };

    setCurrentRetrospective(prev => prev ? {
      ...prev,
      nextActions: [...prev.nextActions, newActionItem]
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 액션 아이템 수정
  const updateActionItem = useCallback((id: string, updates: Partial<ActionItem>) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      nextActions: prev.nextActions.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 액션 아이템 삭제
  const deleteActionItem = useCallback((id: string) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      nextActions: prev.nextActions.filter(item => item.id !== id)
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 액션 아이템 완료 토글
  const toggleActionItemCompletion = useCallback((id: string) => {
    setCurrentRetrospective(prev => prev ? {
      ...prev,
      nextActions: prev.nextActions.map(item =>
        item.id === id ? {
          ...item,
          completed: !item.completed,
          result: !item.completed ? item.result : '' // 미완료로 변경 시 결과 초기화
        } : item
      )
    } : null);
    markAsChanged();
  }, [markAsChanged]);

  // 이전 회고에서 액션 아이템 불러오기
  const loadPreviousActions = useCallback(async (previousDate: string): Promise<ActionItem[]> => {
    try {
      const previousRetrospective = await hybridStorage.getRetrospectiveByDate(previousDate);
      return previousRetrospective ? previousRetrospective.nextActions || [] : [];
    } catch (error) {
      console.error('이전 액션 아이템 로드 실패:', error);
      return [];
    }
  }, []);

  // 통계 계산
  const getStats = useCallback(() => {
    if (!currentRetrospective) {
      return { reflectionCount: 0, actionCount: 0, completedActionCount: 0 };
    }

    const reflectionCount = currentRetrospective.reflections.length;
    const actionCount = currentRetrospective.nextActions.length;
    const completedActionCount = currentRetrospective.nextActions.filter(item => item.completed).length;

    return { reflectionCount, actionCount, completedActionCount };
  }, [currentRetrospective]);

  return {
    currentRetrospective,
    isLoading,
    isSaving,
    hasUnsavedChanges,

    loadRetrospective,
    saveRetrospective,

    updateDailyJournal,
    updateTags,
    updatePreviousGoalCheck,

    addReflection,
    updateReflection,
    deleteReflection,

    addActionItem,
    updateActionItem,
    deleteActionItem,
    toggleActionItemCompletion,

    loadPreviousActions,
    getStats
  };
};