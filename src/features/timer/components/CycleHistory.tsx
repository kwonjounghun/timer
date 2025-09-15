import React, { useState } from 'react';
import { BookOpen, Edit2, Trash2, Save, X } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';
import { CycleHistory as CycleHistoryType, FocusCycle } from '../hooks/useCycleHistory';

interface CycleHistoryProps {
  cycleHistory: CycleHistoryType;
  selectedDate: string;
}

export const CycleHistory: React.FC<CycleHistoryProps> = ({ cycleHistory, selectedDate }) => {
  const { sortedCycles, expandedCycles, toggleExpand, updateCycle, deleteCycle } = cycleHistory;
  const [editingCycle, setEditingCycle] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FocusCycle>>({});

  const startEdit = (cycle: FocusCycle) => {
    setEditingCycle(cycle.id);
    setEditData({
      task: cycle.task,
      result: cycle.result,
      distractions: cycle.distractions,
      thoughts: cycle.thoughts,
    });
  };

  const cancelEdit = () => {
    setEditingCycle(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (editingCycle && editData) {
      updateCycle(editingCycle, editData);
      setEditingCycle(null);
      setEditData({});
    }
  };

  const handleDelete = (cycleId: string) => {
    if (confirm('정말로 이 집중 기록을 삭제하시겠습니까?')) {
      deleteCycle(cycleId);
    }
  };

  if (sortedCycles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <BookOpen className="text-blue-500" size={20} />
        오늘의 집중 기록 ({sortedCycles.length}개 세션)
      </h2>
      <div className="space-y-4">
        {sortedCycles.map((cycle, index) => {
          const isExpanded = expandedCycles.has(cycle.id);
          // 안전하게 시간 변환
          const startDate = new Date(cycle.startTime);
          const endDate = new Date(cycle.endTime);

          const startTime = !isNaN(startDate.getTime())
            ? startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            : '시간 오류';
          const endTime = !isNaN(endDate.getTime())
            ? endDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            : '시간 오류';

          return (
            <div key={cycle.id} className="border border-gray-200 rounded-lg">
              <div className="p-4 flex items-center justify-between">
                <button
                  onClick={() => toggleExpand(cycle.id)}
                  className="flex-1 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-500 bg-blue-100 px-2 py-1 rounded">
                      {index + 1}회차
                    </span>
                    <span className="font-medium text-gray-700">
                      {startTime} - {endTime}
                    </span>
                    <span className="text-gray-600">{cycle.task}</span>
                  </div>
                  <div className="text-gray-400 ml-auto">
                    {isExpanded ? '접기' : '펼치기'}
                  </div>
                </button>

                {/* 편집/삭제 버튼 */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(cycle);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="편집"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cycle.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 space-y-4">
                  {editingCycle === cycle.id ? (
                    // 편집 모드
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">작업 내용</label>
                        <input
                          type="text"
                          value={editData.task || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, task: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">달성한 결과</label>
                        <textarea
                          value={editData.result || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, result: e.target.value }))}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">방해 요소</label>
                        <textarea
                          value={editData.distractions || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, distractions: e.target.value }))}
                          rows={2}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">회고 및 개선점</label>
                        <textarea
                          value={editData.thoughts || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, thoughts: e.target.value }))}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          취소
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 읽기 모드
                    <>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">달성한 결과</h4>
                        <div className="text-gray-700">
                          <MarkdownRenderer content={cycle.result} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">방해 요소</h4>
                        <div className="text-gray-700">
                          <MarkdownRenderer content={cycle.distractions} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">회고 및 개선점</h4>
                        <div className="text-gray-700">
                          <MarkdownRenderer content={cycle.thoughts} />
                        </div>
                      </div>
                      <div className="text-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                          소요시간: {Math.floor(cycle.timeSpent / 60)}분 {cycle.timeSpent % 60}초
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
