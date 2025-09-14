import { useState, useEffect, useCallback } from 'react';

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

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('linkItems');
    if (saved) {
      try {
        const parsedLinks = JSON.parse(saved).map((link: any) => ({
          ...link,
          createdAt: new Date(link.createdAt),
          readAt: link.readAt ? new Date(link.readAt) : undefined,
        }));
        setLinks(parsedLinks);
      } catch (error) {
        console.error('Failed to parse link data:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (links.length > 0) {
      localStorage.setItem('linkItems', JSON.stringify(links));
    }
  }, [links]);

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
  const addLink = useCallback((title: string, url: string, description: string, categories: string[]) => {
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
  }, []);

  // Update existing link
  const updateLink = useCallback((id: string, updates: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) => {
    setLinks(prev => prev.map(link =>
      link.id === id ? { ...link, ...updates } : link
    ));
  }, []);

  // Delete link
  const deleteLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
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
