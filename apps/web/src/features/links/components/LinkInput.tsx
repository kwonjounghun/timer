import React, { useState } from 'react';
import { Plus, Link, FileText, Tag, AlertCircle } from 'lucide-react';

interface LinkInputProps {
  onAddLink: (title: string, url: string, description: string, categories: string[]) => void;
}

export const LinkInput: React.FC<LinkInputProps> = ({ onAddLink }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      onAddLink(title, url, description, categories);
      setTitle('');
      setUrl('');
      setDescription('');
      setCategoryInput('');
      setCategories([]);
    }
  };

  const addCategory = () => {
    const trimmedCategory = categoryInput.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories(prev => [...prev, trimmedCategory]);
      setCategoryInput('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(prev => prev.filter(cat => cat !== categoryToRemove));
  };

  const handleCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCategory();
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문서 제목을 입력하세요..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
          <div className="text-xs text-gray-400 mt-1">
            {title.length}/100
          </div>
        </div>

        {/* URL 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            링크 URL *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {url && !isValidUrl(url) && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle size={12} />
              올바른 URL 형식을 입력해주세요
            </div>
          )}
        </div>

        {/* 카테고리 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <div className="space-y-2">
            {/* 카테고리 입력 필드 */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={handleCategoryKeyPress}
                  placeholder="카테고리 입력 후 Enter 또는 , 키를 누르세요"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={50}
                />
              </div>
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                추가
              </button>
            </div>

            {/* 선택된 카테고리 태그들 */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Enter 또는 쉼표(,)로 카테고리를 추가하세요
          </div>
        </div>

        {/* 설명 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="문서에 대한 간단한 설명을 입력하세요..."
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {description.length}/200
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim() || !url.trim() || !isValidUrl(url)}
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        링크 추가
      </button>
    </form>
  );
};
