/**
 * 회고 폼 컴포넌트 (미니멀 버전)
 * 3개 필드로 구성된 회고 입력 폼
 */

import React, { useState } from 'react';
import { ReflectionData } from '../../domain/types';

/**
 * 회고 폼 Props
 */
interface ReflectionFormProps {
  task: string;
  onSave: (reflection: ReflectionData) => Promise<void>;
  onCancel: () => void;
}

/**
 * 회고 폼 컴포넌트
 */
export function ReflectionForm({ task, onSave, onCancel }: ReflectionFormProps) {
  const [reflection, setReflection] = useState<ReflectionData>({
    result: '',
    distractions: '',
    thoughts: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!reflection.result.trim() && !reflection.distractions.trim() && !reflection.thoughts.trim()) {
      return;
    }
    
    try {
      setIsSaving(true);
      await onSave(reflection);
    } catch (error) {
      console.error('회고 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateReflection = (field: keyof ReflectionData, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        10분 집중이 완료되었습니다!
      </h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">작업 내용</div>
        <div className="bg-white p-3 rounded border border-green-200 text-gray-800">
          {task || '작업 내용이 없습니다'}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이번 작업에서 이뤄낸 결과
          </label>
          <textarea
            value={reflection.result}
            onChange={(e) => updateReflection('result', e.target.value)}
            className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical"
            rows={2}
            placeholder="작업을 통해 어떤 성과를 얻으셨나요?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작업을 방해한 요소들
          </label>
          <textarea
            value={reflection.distractions}
            onChange={(e) => updateReflection('distractions', e.target.value)}
            className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical"
            rows={2}
            placeholder="작업 중에 어떤 것들이 집중을 방해했나요?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이번 10분에 대한 전체적인 회고
          </label>
          <textarea
            value={reflection.thoughts}
            onChange={(e) => updateReflection('thoughts', e.target.value)}
            className="w-full p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-vertical"
            rows={2}
            placeholder="작업에 대한 전체적인 생각은 어떠신가요?"
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={(!reflection.result.trim() && !reflection.distractions.trim() && !reflection.thoughts.trim()) || isSaving}
          className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
        
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          취소
        </button>
      </div>
    </div>
  );
}
