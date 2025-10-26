import React from 'react';
import { Calendar, Edit } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

interface EmptyStateProps {
  selectedDate: string;
  onStartEdit: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ selectedDate, onStartEdit }) => {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          <Calendar className="text-blue-500" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          아직 작성된 계획이 없어요
        </h3>
        <p className="text-gray-500 mb-6">
          {formatDate(selectedDate)}에 대한 일일 점검을 시작해보세요!<br />
          아침, 점심, 저녁으로 나누어 하루를 계획하고 회고할 수 있어요.
        </p>
      </div>
      <button
        onClick={onStartEdit}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <Edit className="inline mr-2" size={18} />
        생성하기
      </button>
      <div className="mt-4 text-sm text-gray-400">
        💡 하루를 더 의미있게 보내기 위한 질문들로 구성되어 있어요<br />
        ✨ 답변 작성 시 마크다운 문법을 사용할 수 있습니다 (**굵게**, *기울임*, - 목록 등)
      </div>
    </div>
  );
};
