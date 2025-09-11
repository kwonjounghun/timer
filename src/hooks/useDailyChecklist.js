import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useDailyChecklist = () => {
  const [checkData, setCheckData] = useLocalStorage('dailyCheckData', {});
  const [expandedSections, setExpandedSections] = useState({
    morning: false,
    lunch: false,
    evening: false
  });
  const [editMode, setEditMode] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateAnswer = (selectedDate, section, questionIndex, value) => {
    const newData = {
      ...checkData,
      [selectedDate]: {
        ...checkData[selectedDate],
        [section]: {
          ...checkData[selectedDate]?.[section],
          [questionIndex]: value
        }
      }
    };
    setCheckData(newData);
  };

  const toggleEditMode = () => {
    setEditMode(true);
    // 편집 모드 진입 시 아침 점검 섹션을 자동으로 열어줌
    setExpandedSections(prev => ({
      ...prev,
      morning: true
    }));
  };

  const completeEdit = () => {
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const hasCheckDataForSelectedDate = (selectedDate) => {
    return checkData[selectedDate] && 
      Object.keys(checkData[selectedDate]).some(section => 
        checkData[selectedDate][section] && 
        Object.values(checkData[selectedDate][section]).some(answer => answer && answer.trim())
      );
  };

  return {
    checkData,
    expandedSections,
    editMode,
    toggleSection,
    updateAnswer,
    toggleEditMode,
    completeEdit,
    cancelEdit,
    hasCheckDataForSelectedDate
  };
};
