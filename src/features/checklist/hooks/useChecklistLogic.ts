import { useState, useEffect, useCallback, useRef } from 'react';
import { checklistTemplate } from '../../../constants/checklistTemplate';
import { getStorageInfo } from '../../../utils/storageType';
import { formatMarkdown, hasCodeBlocks } from '../../../utils/markdownFormatter';
import { hybridStorage } from '../../../utils/hybridStorage';

export interface ChecklistData {
  id?: string; // ID 추가
  date: string;
  data: Record<string, Record<number, string>>;
}

export interface SectionExpansionState {
  morning: boolean;
  lunch: boolean;
  evening: boolean;
}

export interface PreviewState {
  [key: string]: boolean; // sectionKey_questionIndex: boolean
}

export interface ChecklistLogic {
  // State
  checklistData: Record<string, ChecklistData>;
  expandedSections: SectionExpansionState;
  previewState: PreviewState;
  editMode: boolean;
  hasData: boolean;
  storageInfo: any;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveError: string | null;

  // Actions
  toggleSection: (sectionKey: string) => void;
  updateAnswer: (date: string, sectionKey: string, questionIndex: number, value: string) => void;
  updateAnswerWithFormatting: (date: string, sectionKey: string, questionIndex: number, value: string) => void;
  togglePreview: (sectionKey: string, questionIndex: number) => void;
  toggleEditMode: () => void;
  completeEdit: () => void;
  cancelEdit: () => void;
  saveChecklist: (date: string) => Promise<void>;
}

export const useChecklistLogic = (selectedDate: string): ChecklistLogic => {
  // Checklist State
  const [checklistData, setChecklistData] = useState<Record<string, ChecklistData>>({});
  const [expandedSections, setExpandedSections] = useState<SectionExpansionState>({
    morning: true,
    lunch: false,
    evening: false,
  });
  const [previewState, setPreviewState] = useState<PreviewState>({});
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Storage info
  const storageInfo = getStorageInfo();

  // Get data for selected date
  const hasDataForDate = (date: string): boolean => {
    const data = checklistData[date];
    if (!data) return false;

    return Object.values(data.data).some(section =>
      Object.values(section).some(answer => answer.trim().length > 0)
    );
  };

  const hasData = hasDataForDate(selectedDate);

  // Toggle section expansion
  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey as keyof SectionExpansionState]
    }));
  }, []);

  // Update answer (no auto-save)
  const updateAnswer = useCallback((date: string, sectionKey: string, questionIndex: number, value: string) => {
    setChecklistData(prev => {
      const newData = {
        ...prev,
        [date]: {
          ...prev[date],
          date,
          data: {
            ...prev[date]?.data,
            [sectionKey]: {
              ...prev[date]?.data?.[sectionKey],
              [questionIndex]: value,
            }
          }
        }
      };
      return newData;
    });

    // 변경사항이 있음을 표시
    setHasUnsavedChanges(true);
  }, []);

  // Format and update answer with code formatting
  const updateAnswerWithFormatting = useCallback((date: string, sectionKey: string, questionIndex: number, value: string) => {
    let formattedValue = value;

    // 코드블럭이 있는 경우에만 포맷팅 적용
    if (hasCodeBlocks(value)) {
      try {
        console.log('Formatting content with code blocks:', value);
        formattedValue = formatMarkdown(value);
        console.log('Formatted result:', formattedValue);

        // 포맷팅이 실제로 변경되었는지 확인
        if (formattedValue !== value) {
          console.log('Content was formatted successfully');
        } else {
          console.log('No formatting changes applied');
        }
      } catch (error) {
        console.warn('Failed to format markdown:', error);
        formattedValue = value; // 포맷팅 실패 시 원본 사용
      }
    } else {
      console.log('No code blocks found, skipping formatting');
    }

    updateAnswer(date, sectionKey, questionIndex, formattedValue);
  }, [updateAnswer]);

  // Toggle preview
  const togglePreview = useCallback((sectionKey: string, questionIndex: number) => {
    const key = `${sectionKey}_${questionIndex}`;
    setPreviewState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // Edit mode management
  const toggleEditMode = useCallback(() => {
    setEditMode(prev => {
      const newEditMode = !prev;

      // If switching to edit mode and no data exists for this date, initialize it
      if (newEditMode && !checklistData[selectedDate]) {
        const emptyData: Record<string, Record<number, string>> = {};
        Object.keys(checklistTemplate).forEach(sectionKey => {
          emptyData[sectionKey] = {};
        });

        setChecklistData(prevData => ({
          ...prevData,
          [selectedDate]: {
            date: selectedDate,
            data: emptyData
          }
        }));
      }

      return newEditMode;
    });
  }, [checklistData, selectedDate]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    // Here you could revert changes if needed
  }, []);

  // Manual save function
  const saveChecklist = useCallback(async (date: string) => {
    const checklistToSave = checklistData[date];
    if (!checklistToSave) {
      console.warn('저장할 체크리스트 데이터가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      // 기존 ID가 있으면 업데이트, 없으면 새로 생성
      if (checklistToSave.id) {
        await hybridStorage.updateDailyChecklist(checklistToSave.id, checklistToSave);
      } else {
        // 새로 생성하고 ID를 받아서 상태 업데이트
        const newId = await hybridStorage.saveDailyChecklist(checklistToSave);
        setChecklistData(currentData => ({
          ...currentData,
          [date]: {
            ...currentData[date],
            id: newId
          }
        }));
      }

      // 저장 완료 후 변경사항 플래그 리셋
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('체크리스트 저장 실패:', error);
      throw error; // 호출하는 곳에서 에러 처리할 수 있도록
    } finally {
      setIsSaving(false);
    }
  }, [checklistData]);

  const completeEdit = useCallback(async () => {
    try {
      setSaveError(null);
      // 변경사항이 있으면 저장
      if (hasUnsavedChanges) {
        await saveChecklist(selectedDate);
      }
      setEditMode(false);
    } catch (error) {
      console.error('체크리스트 저장 중 오류 발생:', error);
      setSaveError(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
      // 저장 실패 시에도 편집 모드는 종료 (사용자 경험을 위해)
      setEditMode(false);
    }
  }, [hasUnsavedChanges, saveChecklist, selectedDate]);

  // Load data from localStorage on mount only
  useEffect(() => {
    const loadChecklistData = async () => {
      try {
        const checklists = await hybridStorage.getAllDailyChecklists();
        // Convert array to object format
        const dataObject: Record<string, ChecklistData> = {};
        checklists.forEach((checklist: any) => {
          dataObject[checklist.date] = checklist;
        });
        setChecklistData(dataObject);
      } catch (error) {
        console.error('Failed to load checklist data:', error);
      }
    };

    loadChecklistData();
  }, []); // 컴포넌트 마운트 시에만 로드

  // 데이터가 로드된 후 변경사항 플래그 초기화
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [selectedDate]);

  return {
    // State
    checklistData,
    expandedSections,
    previewState,
    editMode,
    hasData,
    storageInfo,
    isSaving,
    hasUnsavedChanges,
    saveError,

    // Actions
    toggleSection,
    updateAnswer,
    updateAnswerWithFormatting,
    togglePreview,
    toggleEditMode,
    completeEdit,
    cancelEdit,
    saveChecklist,
  };
};
