import { useState, useEffect, useCallback } from 'react';
import { hybridStorage } from '../../../utils/hybridStorage';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  categories: string[];
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface LinksLogic {
  links: LinkItem[];
  filteredLinks: LinkItem[];
  searchQuery: string;
  selectedCategory: string;
  categories: string[];
  addLink: (title: string, url: string, description: string, categories: string[]) => void;
  updateLink: (id: string, updates: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) => void;
  deleteLink: (id: string) => void;
  toggleReadStatus: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  getStats: () => { total: number; read: number; unread: number };
}

export const useLinksLogic = (): LinksLogic => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // Load data from hybrid storage on mount
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const links = await hybridStorage.getLinks();
        const parsedLinks = links.map((link: any) => {
          const createdAt = new Date(link.createdAt);
          const readAt = link.readAt ? new Date(link.readAt) : undefined;

          return {
            ...link,
            createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            readAt: readAt && !isNaN(readAt.getTime()) ? readAt : undefined,
          };
        });
        setLinks(parsedLinks);
      } catch (error) {
        console.error('Failed to load links:', error);
      }
    };

    loadLinks();
  }, []);

  // Remove the automatic save effect since we're using hybrid storage for individual operations

  // Get unique categories
  const categories = ['전체', ...Array.from(new Set(links.flatMap(link => link.categories)))];

  // Filter links based on search query and category
  const filteredLinks = links.filter(link => {
    const matchesSearch = searchQuery === '' ||
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === '전체' || link.categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Add new link
  const addLink = useCallback(async (title: string, url: string, description: string, categories: string[]) => {
    if (!title.trim() || !url.trim()) return;

    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      categories: categories.filter(cat => cat.trim() !== ''),
      isRead: false,
      createdAt: new Date(),
    };

    setLinks(prev => [...prev, newLink]);

    // Save using hybrid storage
    try {
      await hybridStorage.saveLink(newLink);
    } catch (error) {
      console.error('링크 저장 실패:', error);
    }
  }, []);

  // Update existing link
  const updateLink = useCallback(async (id: string, updates: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) => {
    setLinks(prev => prev.map(link =>
      link.id === id ? { ...link, ...updates } : link
    ));

    // Save using hybrid storage
    try {
      await hybridStorage.updateLink(id, updates);
    } catch (error) {
      console.error('링크 업데이트 실패:', error);
    }
  }, []);

  // Delete link
  const deleteLink = useCallback(async (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));

    // Save using hybrid storage
    try {
      await hybridStorage.deleteLink(id);
    } catch (error) {
      console.error('링크 삭제 실패:', error);
    }
  }, []);

  // Toggle read status
  const toggleReadStatus = useCallback((id: string) => {
    setLinks(prev => prev.map(link => {
      if (link.id === id) {
        const isRead = !link.isRead;
        return {
          ...link,
          isRead,
          readAt: isRead ? new Date() : undefined,
        };
      }
      return link;
    }));
  }, []);

  // Get statistics
  const getStats = useCallback(() => {
    const total = links.length;
    const read = links.filter(link => link.isRead).length;
    const unread = total - read;
    return { total, read, unread };
  }, [links]);

  return {
    links,
    filteredLinks,
    searchQuery,
    selectedCategory,
    categories,
    addLink,
    updateLink,
    deleteLink,
    toggleReadStatus,
    setSearchQuery,
    setSelectedCategory,
    getStats,
  };
};
