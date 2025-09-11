import { ChevronDown, ChevronUp, Edit, Target, BookOpen, AlertCircle, Clock } from 'lucide-react';
import { useFocusCycles } from '../hooks/useFocusCycles';
import { formatDate, formatTime } from '../utils/dateUtils';
import { MarkdownRenderer } from './MarkdownRenderer';

export const CycleHistory = ({ selectedDate }) => {
  const {
    cyclesByDate,
    expandedCycles,
    editingCycle,
    editCycle,
    saveEdit,
    deleteCycle,
    toggleExpand,
    setEditingCycle
  } = useFocusCycles();

  const currentDateCycles = cyclesByDate[selectedDate] || [];
  const sortedCycles = [...currentDateCycles].sort((a, b) => a.startTime - b.startTime);

  if (sortedCycles.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <BookOpen className="text-blue-500" size={20} />
        {formatDate(selectedDate)} 집중 기록
      </h2>
      <div className="space-y-2">
        {sortedCycles.map((cycle, index) => {
          const isExpanded = expandedCycles.has(cycle.id);
          const startTime = formatTime(cycle.startTime);
          const endTime = formatTime(cycle.endTime);
          
          return (
            <div key={cycle.id} className="border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="p-3 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => toggleExpand(cycle.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-500 bg-blue-100 px-2 py-1 rounded">
                    {index + 1}cycle
                  </span>
                  <span className="font-medium text-gray-700">
                    {startTime} - {endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editingCycle && editingCycle.id === cycle.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit(selectedDate);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        저장
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCycle(null);
                        }}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                      >
                        취소
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCycle(selectedDate, cycle.id);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editCycle(cycle);
                        }}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCycle(selectedDate, cycle.id);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100">
                  {editingCycle && editingCycle.id === cycle.id ? (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                        <Edit size={18} />
                        집중 기록 수정
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            작업 내용
                          </label>
                          <input
                            type="text"
                            value={editingCycle.task}
                            onChange={(e) => setEditingCycle(prev => ({...prev, task: e.target.value}))}
                            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="작업 내용을 입력해주세요"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            이번 작업에서 이뤄낸 결과
                          </label>
                          <textarea
                            value={editingCycle.result}
                            onChange={(e) => setEditingCycle(prev => ({...prev, result: e.target.value}))}
                            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-vertical max-h-[500px]"
                            rows={3}
                            placeholder="어떤 성과를 얻으셨나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            작업을 방해한 요소들
                          </label>
                          <textarea
                            value={editingCycle.distractions}
                            onChange={(e) => setEditingCycle(prev => ({...prev, distractions: e.target.value}))}
                            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-vertical max-h-[500px]"
                            rows={3}
                            placeholder="어떤 것들이 집중을 방해했나요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            이번 10분에 대한 전체적인 회고
                          </label>
                          <textarea
                            value={editingCycle.thoughts}
                            onChange={(e) => setEditingCycle(prev => ({...prev, thoughts: e.target.value}))}
                            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-vertical max-h-[500px]"
                            rows={3}
                            placeholder="어떤 생각이 드시나요? 다음에는 어떻게 개선할 수 있을까요? (마크다운 지원: **굵게**, *기울임*, - 목록 등)"
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setEditingCycle(null)}
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                          >
                            저장하기
                          </button>
                          <button
                            onClick={() => setEditingCycle(null)}
                            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      {/* 작업 내용 */}
                      <div className="pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target size={16} className="text-blue-600" />
                          <span className="font-semibold text-gray-800">작업 내용</span>
                        </div>
                        <p className="text-gray-700 ml-6">{cycle.task}</p>
                      </div>

                      {/* 결과 */}
                      <div className="py-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={16} className="text-green-600" />
                          <span className="font-semibold text-gray-800">달성한 결과</span>
                        </div>
                        <div className="text-gray-700 ml-6">
                          <MarkdownRenderer content={cycle.result} />
                        </div>
                      </div>

                      {/* 방해요소 */}
                      <div className="py-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle size={16} className="text-red-600" />
                          <span className="font-semibold text-gray-800">방해 요소</span>
                        </div>
                        <div className="text-gray-700 ml-6">
                          <MarkdownRenderer content={cycle.distractions} />
                        </div>
                      </div>

                      {/* 회고 */}
                      <div className="py-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={16} className="text-purple-600" />
                          <span className="font-semibold text-gray-800">회고 및 개선점</span>
                        </div>
                        <div className="text-gray-700 ml-6">
                          <MarkdownRenderer content={cycle.thoughts} />
                        </div>
                      </div>

                      {/* 소요시간 */}
                      <div className="pt-4 text-center">
                        <span className="text-sm text-gray-600 font-medium">
                          소요시간: {Math.floor(cycle.timeSpent / 60)}분 {cycle.timeSpent % 60}초
                        </span>
                      </div>
                    </div>
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
