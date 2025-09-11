import { useState, useEffect, useCallback } from 'react';
import { hybridStorage } from '../utils/hybridStorage';
import { getStorageInfo } from '../utils/storageType';
import { testFirebaseConnection } from '../utils/firebaseApi';

export const useDailyChecklist = () => {
  const [checkData, setCheckData] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    morning: false,
    lunch: false,
    evening: false
  });
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storageType, setStorageType] = useState('localStorage');
  const [firebaseConnectionStatus, setFirebaseConnectionStatus] = useState(null);

  // 스토리지 타입 감지 및 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const storageInfo = getStorageInfo();
        setStorageType(storageInfo.type);
        
        // Firebase 연결 테스트 (개발 환경에서만)
        if (storageInfo.type === 'firebase' && import.meta.env.DEV) {
          console.log('🔥 Firebase 연결 테스트 시작...');
          const connectionTest = await testFirebaseConnection();
          setFirebaseConnectionStatus(connectionTest);
          console.log('🔥 Firebase 연결 테스트 결과:', connectionTest);
        }
        
        // 모든 체크리스트 데이터 로드
        const allChecklists = await hybridStorage.getAllDailyChecklists();
        
        // 날짜별로 그룹화
        const groupedData = {};
        allChecklists.forEach(checklist => {
          if (checklist.date) {
            // checklist.data에 실제 체크리스트 내용이 들어있음
            groupedData[checklist.date] = checklist.data || {};
          }
        });
        
        setCheckData(groupedData);
      } catch (error) {
        console.error('체크리스트 데이터 로드 실패:', error);
        setCheckData({});
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateAnswer = useCallback(async (selectedDate, section, questionIndex, value) => {
    try {
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
      
      // 하이브리드 스토리지에 저장
      const checklistData = {
        date: selectedDate,
        data: newData[selectedDate]
      };
      
      // 기존 체크리스트가 있는지 확인
      const existingChecklist = await hybridStorage.getDailyChecklistByDate(selectedDate);
      
      if (existingChecklist) {
        await hybridStorage.updateDailyChecklist(existingChecklist.id, checklistData);
      } else {
        await hybridStorage.saveDailyChecklist(checklistData);
      }
      
      setCheckData(newData);
    } catch (error) {
      console.error('체크리스트 업데이트 실패:', error);
    }
  }, [checkData]);

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
    isLoading,
    storageType,
    firebaseConnectionStatus,
    toggleSection,
    updateAnswer,
    toggleEditMode,
    completeEdit,
    cancelEdit,
    hasCheckDataForSelectedDate
  };
};
