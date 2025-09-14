import { useState, useEffect, useCallback } from 'react';
import { checklistTemplate } from '../../../constants/checklistTemplate';
import { getStorageInfo } from '../../../utils/storageType';

export interface ChecklistData {
  date: string;
  data: Record<string, Record<number, string>>;
}

export interface SectionExpansionState {
  morning: boolean;
  lunch: boolean;
  evening: boolean;
  reflection: boolean;
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

  // Actions
  toggleSection: (sectionKey: string) => void;
  updateAnswer: (date: string, sectionKey: string, questionIndex: number, value: string) => void;
  togglePreview: (sectionKey: string, questionIndex: number) => void;
  toggleEditMode: () => void;
  completeEdit: () => void;
  cancelEdit: () => void;
}

export const useChecklistLogic = (selectedDate: string): ChecklistLogic => {
  // Checklist State
  const [checklistData, setChecklistData] = useState<Record<string, ChecklistData>>({});
  const [expandedSections, setExpandedSections] = useState<SectionExpansionState>({
    morning: true,
    lunch: false,
    evening: false,
    reflection: false,
  });
  const [previewState, setPreviewState] = useState<PreviewState>({});
  const [editMode, setEditMode] = useState(false);

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

  // Update answer
  const updateAnswer = useCallback((date: string, sectionKey: string, questionIndex: number, value: string) => {
    setChecklistData(prev => ({
      ...prev,
      [date]: {
        date,
        data: {
          ...prev[date]?.data,
          [sectionKey]: {
            ...prev[date]?.data?.[sectionKey],
            [questionIndex]: value,
          }
        }
      }
    }));
  }, []);

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

  const completeEdit = useCallback(() => {
    setEditMode(false);
    // Here you could add persistence logic
  }, []);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    // Here you could revert changes if needed
  }, []);

  // Load data from localStorage on mount only
  useEffect(() => {
    const saved = localStorage.getItem('dailyChecklistData');
    if (saved) {
      try {
        setChecklistData(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse checklist data:', error);
      }
    }
  }, []); // 컴포넌트 마운트 시에만 로드

  // Save data to localStorage when it changes (only if not empty)
  useEffect(() => {
    if (Object.keys(checklistData).length > 0) {
      localStorage.setItem('dailyChecklistData', JSON.stringify(checklistData));
    }
  }, [checklistData]);

  return {
    // State
    checklistData,
    expandedSections,
    previewState,
    editMode,
    hasData,
    storageInfo,

    // Actions
    toggleSection,
    updateAnswer,
    togglePreview,
    toggleEditMode,
    completeEdit,
    cancelEdit,
  };
};
