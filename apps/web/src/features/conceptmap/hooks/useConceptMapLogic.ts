import { useState, useCallback, useEffect } from 'react';
import { hybridStorage } from '../../../utils/hybridStorage';

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
    const loadConceptMaps = async () => {
      try {
        console.log('Loading concept maps from hybrid storage...');
        const conceptMaps = await hybridStorage.getConceptMaps();
        console.log('Raw concept maps data:', conceptMaps);

        const conceptMapsWithDates = conceptMaps.map((item: any) => {
          const createdAt = new Date(item.createdAt);
          return {
            ...item,
            createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt
          };
        });
        setConceptMaps(conceptMapsWithDates);
        console.log('Concept maps loaded from hybrid storage:', conceptMapsWithDates.length, 'items');
      } catch (error) {
        console.error('Failed to load concept map data:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadConceptMaps();
  }, []);

  // Remove the manual save function since we're using hybrid storage for individual operations

  // 컨셉맵 추가
  const addConceptMap = useCallback(async (title: string, url: string) => {
    const newConceptMap: ConceptMapItem = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      createdAt: new Date()
    };
    setConceptMaps(prev => [...prev, newConceptMap]);

    // Save using hybrid storage
    try {
      await hybridStorage.saveConceptMap(newConceptMap);
    } catch (error) {
      console.error('컨셉맵 저장 실패:', error);
    }
  }, []);

  // 컨셉맵 수정
  const updateConceptMap = useCallback(async (id: string, updates: Partial<Omit<ConceptMapItem, 'id' | 'createdAt'>>) => {
    setConceptMaps(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates }
        : item
    ));

    // Save using hybrid storage
    try {
      await hybridStorage.updateConceptMap(id, updates);
    } catch (error) {
      console.error('컨셉맵 업데이트 실패:', error);
    }
  }, []);

  // 컨셉맵 삭제
  const deleteConceptMap = useCallback(async (id: string) => {
    setConceptMaps(prev => prev.filter(item => item.id !== id));

    // Save using hybrid storage
    try {
      await hybridStorage.deleteConceptMap(id);
    } catch (error) {
      console.error('컨셉맵 삭제 실패:', error);
    }
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
