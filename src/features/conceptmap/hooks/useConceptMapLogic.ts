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

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const conceptMapsWithDates = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setConceptMaps(conceptMapsWithDates);
      }
    } catch (error) {
      console.error('Failed to load concept map data:', error);
    }
  }, []);

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conceptMaps));
    } catch (error) {
      console.error('Failed to save concept map data:', error);
    }
  }, [conceptMaps]);

  // 컨셉맵 추가
  const addConceptMap = useCallback((title: string, url: string) => {
    const newConceptMap: ConceptMapItem = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      createdAt: new Date()
    };
    setConceptMaps(prev => [...prev, newConceptMap]);
  }, []);

  // 컨셉맵 수정
  const updateConceptMap = useCallback((id: string, updates: Partial<Omit<ConceptMapItem, 'id' | 'createdAt'>>) => {
    setConceptMaps(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates }
        : item
    ));
  }, []);

  // 컨셉맵 삭제
  const deleteConceptMap = useCallback((id: string) => {
    setConceptMaps(prev => prev.filter(item => item.id !== id));
  }, []);

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
