import { useState, useCallback, useEffect } from 'react';

export interface ConceptMapItem {
  id: string;
  title: string;
  url: string;
  createdAt: Date;
}

export interface ConceptMapLogic {
  conceptMaps: ConceptMapItem[];
  addConceptMap: (title: string, url: string) => void;
  updateConceptMap: (id: string, updates: Partial<Omit<ConceptMapItem, 'id' | 'createdAt'>>) => void;
  deleteConceptMap: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConceptMaps: ConceptMapItem[];
}

const STORAGE_KEY = 'conceptmap-links';

export const useConceptMapLogic = (): ConceptMapLogic => {
  const [conceptMaps, setConceptMaps] = useState<ConceptMapItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    try {
      console.log('Loading concept maps from localStorage...');
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('Raw stored data:', stored);

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed data:', parsed);

        const conceptMapsWithDates = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setConceptMaps(conceptMapsWithDates);
        console.log('Concept maps loaded from localStorage:', conceptMapsWithDates.length, 'items');
      } else {
        console.log('No concept maps found in localStorage');
      }
    } catch (error) {
      console.error('Failed to load concept map data:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 수동으로 저장하는 함수
  const saveToStorage = useCallback((data: ConceptMapItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Concept maps saved to localStorage:', data.length, 'items');
    } catch (error) {
      console.error('Failed to save concept map data:', error);
    }
  }, []);

  // 컨셉맵 추가
  const addConceptMap = useCallback((title: string, url: string) => {
    const newConceptMap: ConceptMapItem = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      createdAt: new Date()
    };
    setConceptMaps(prev => {
      const newList = [...prev, newConceptMap];
      saveToStorage(newList);
      return newList;
    });
  }, [saveToStorage]);

  // 컨셉맵 수정
  const updateConceptMap = useCallback((id: string, updates: Partial<Omit<ConceptMapItem, 'id' | 'createdAt'>>) => {
    setConceptMaps(prev => {
      const newList = prev.map(item =>
        item.id === id
          ? { ...item, ...updates }
          : item
      );
      saveToStorage(newList);
      return newList;
    });
  }, [saveToStorage]);

  // 컨셉맵 삭제
  const deleteConceptMap = useCallback((id: string) => {
    setConceptMaps(prev => {
      const newList = prev.filter(item => item.id !== id);
      saveToStorage(newList);
      return newList;
    });
  }, [saveToStorage]);

  // 검색 필터링
  const filteredConceptMaps = conceptMaps.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    conceptMaps,
    addConceptMap,
    updateConceptMap,
    deleteConceptMap,
    searchQuery,
    setSearchQuery,
    filteredConceptMaps
  };
};
