import React, { useState, useEffect } from 'react';
import { Plus, Save, CheckCircle, Circle, Trash2, Edit, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { useRetrospectiveLogic } from './hooks/useRetrospectiveLogic';
import { useAppContext } from '../../contexts/AppContext';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

const RetrospectiveFeature: React.FC = () => {
  const { selectedDate } = useAppContext();

  const [newReflectionContent, setNewReflectionContent] = useState('');
  const [newGoodPoints, setNewGoodPoints] = useState('');
  const [newImprovePoints, setNewImprovePoints] = useState('');
  const [newActionContent, setNewActionContent] = useState('');
  const [editingDailyJournal, setEditingDailyJournal] = useState(false);
  const [previewDailyJournal, setPreviewDailyJournal] = useState(false);
  const [editingReflection, setEditingReflection] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [previewReflectionContent, setPreviewReflectionContent] = useState(false);
  const [previewGoodPoints, setPreviewGoodPoints] = useState(false);
  const [previewImprovePoints, setPreviewImprovePoints] = useState(false);
  const [previewActionContent, setPreviewActionContent] = useState(false);

  // 지난 목표 점검 관련 상태
  const [editingPreviousGoals, setEditingPreviousGoals] = useState(false);
  const [previewPreviousGoals, setPreviewPreviousGoals] = useState(false);

  const {
    currentRetrospective,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    loadRetrospective,
    saveRetrospective,
    updateDailyJournal,
    addReflection,
    updateReflection,
    deleteReflection,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    toggleActionItemCompletion,
    loadPreviousActions,
    updatePreviousGoalCheck,
    getStats
  } = useRetrospectiveLogic();

  // 날짜 변경 시 회고 로드
  useEffect(() => {
    loadRetrospective(selectedDate);
  }, [selectedDate, loadRetrospective]);

  const handleSave = async () => {
    try {
      await saveRetrospective();
    } catch (error) {
      alert('저장 실패: ' + (error as Error).message);
    }
  };

  const handleAddReflection = () => {
    if (!newReflectionContent.trim()) return;
    addReflection(newReflectionContent, newGoodPoints, newImprovePoints);
    setNewReflectionContent('');
    setNewGoodPoints('');
    setNewImprovePoints('');
  };

  const handleAddAction = () => {
    if (!newActionContent.trim()) return;
    addActionItem(newActionContent);
    setNewActionContent('');
  };

  // 지난 목표 점검 관련 핸들러
  const handleUpdatePreviousGoals = (content: string) => {
    updatePreviousGoalCheck(content);
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">회고를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!currentRetrospective) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">회고를 불러올 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">일일 회고</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>회고 {stats.reflectionCount}개</span>
            <span>•</span>
            <span>액션 {stats.actionCount}개</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${hasUnsavedChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. 지난 목표 점검 */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 지난 목표 점검</h2>
          <div>
            {editingPreviousGoals ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPreviousGoals(!previewPreviousGoals)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {previewPreviousGoals ? '편집' : '미리보기'}
                  </button>
                  <button
                    onClick={() => setEditingPreviousGoals(false)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg"
                  >
                    완료
                  </button>
                </div>
                {previewPreviousGoals ? (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    {currentRetrospective.previousGoalCheck?.content ? (
                      <div className="text-base leading-relaxed text-gray-800">
                        <MarkdownRenderer content={currentRetrospective.previousGoalCheck.content} />
                      </div>
                    ) : (
                      <p className="italic text-sm text-gray-400">
                        이전 목표 점검 내용이 없습니다. 수정 버튼을 눌러 작성해주세요.
                      </p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={currentRetrospective.previousGoalCheck?.content || ''}
                    onChange={(e) => handleUpdatePreviousGoals(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical max-h-[500px]"
                    rows={4}
                    placeholder="이전에 목표했던 것들을 잘 지켰는지 점검해보세요... (마크다운 문법 지원: **굵게**, *기울임*, - 목록, 1. 번호목록, ```코드블럭``` 등)"
                  />
                )}
              </div>
            ) : (
              <div className="leading-relaxed text-gray-700">
                {currentRetrospective.previousGoalCheck?.content ? (
                  <div className="text-base leading-relaxed text-gray-800">
                    <MarkdownRenderer content={currentRetrospective.previousGoalCheck.content} />
                  </div>
                ) : (
                  <p className="italic text-sm text-gray-400">
                    이전 목표 점검 내용이 없습니다. 수정 버튼을 눌러 작성해주세요.
                  </p>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => setEditingPreviousGoals(true)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>


        {/* 2. 오늘의 기록 */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 오늘의 기록</h2>
          <div>
            {editingDailyJournal ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDailyJournal(!previewDailyJournal)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {previewDailyJournal ? '편집' : '미리보기'}
                  </button>
                  <button
                    onClick={() => setEditingDailyJournal(false)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg"
                  >
                    완료
                  </button>
                </div>
                {previewDailyJournal ? (
                  <div className="min-h-[200px] p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {currentRetrospective.dailyJournal.content ? (
                      <MarkdownRenderer content={currentRetrospective.dailyJournal.content} />
                    ) : (
                      <p className="text-gray-400">내용이 없습니다.</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={currentRetrospective.dailyJournal.content}
                    onChange={(e) => updateDailyJournal(e.target.value)}
                    placeholder="오늘 하루를 자유롭게 기록해보세요. 있었던 일, 기분, 느낀, 생각들...

**마크다운 문법 사용 가능**: **굵은글씨**, *기울임*,
- 목록 항목
- [ ] 체크박스
> 인용문
`코드` 등"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={8}
                    autoFocus
                  />
                )}
              </div>
            ) : (
              <div
                className="min-h-[120px] p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => setEditingDailyJournal(true)}
              >
                {currentRetrospective.dailyJournal.content ? (
                  <MarkdownRenderer content={currentRetrospective.dailyJournal.content} />
                ) : (
                  <p className="text-gray-500">오늘 하루를 자유롭게 기록해보세요. 있었던 일, 기분, 느낀, 생각들...<br /><span className="text-sm">클릭하여 편집</span></p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 3. 오늘의 회고 */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">🤔 오늘의 회고</h2>

          {/* 회고 추가 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">회고할 내용</label>
                  <button
                    onClick={() => setPreviewReflectionContent(!previewReflectionContent)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {previewReflectionContent ? '편집' : '미리보기'}
                  </button>
                </div>
                {previewReflectionContent ? (
                  <div className="min-h-[80px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {newReflectionContent ? (
                      <MarkdownRenderer content={newReflectionContent} />
                    ) : (
                      <p className="text-gray-400 text-sm">내용이 없습니다.</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={newReflectionContent}
                    onChange={(e) => {
                      setNewReflectionContent(e.target.value);
                      // 자동 크기 조절
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="무엇에 대해 회고할건지 입력하세요... (예: 오늘 프로젝트 발표를 했다)

마크다운 문법 사용 가능: **굵은글씨**, *기울임*, 목록, 체크박스 등"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                    rows={3}
                    style={{ minHeight: '80px' }}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-green-700">잘한점</label>
                    <button
                      onClick={() => setPreviewGoodPoints(!previewGoodPoints)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      {previewGoodPoints ? '편집' : '미리보기'}
                    </button>
                  </div>
                  {previewGoodPoints ? (
                    <div className="min-h-[80px] p-3 border border-green-200 rounded-lg bg-green-50">
                      {newGoodPoints ? (
                        <MarkdownRenderer content={newGoodPoints} />
                      ) : (
                        <p className="text-gray-400 text-sm">내용이 없습니다.</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={newGoodPoints}
                      onChange={(e) => {
                        setNewGoodPoints(e.target.value);
                        // 자동 크기 조절
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder="이 일에서 잘했던 점은... (마크다운 문법 사용 가능)"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none overflow-hidden"
                      rows={3}
                      style={{ minHeight: '80px' }}
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-orange-700">아쉬운점</label>
                    <button
                      onClick={() => setPreviewImprovePoints(!previewImprovePoints)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      {previewImprovePoints ? '편집' : '미리보기'}
                    </button>
                  </div>
                  {previewImprovePoints ? (
                    <div className="min-h-[80px] p-3 border border-orange-200 rounded-lg bg-orange-50">
                      {newImprovePoints ? (
                        <MarkdownRenderer content={newImprovePoints} />
                      ) : (
                        <p className="text-gray-400 text-sm">내용이 없습니다.</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={newImprovePoints}
                      onChange={(e) => {
                        setNewImprovePoints(e.target.value);
                        // 자동 크기 조절
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder="이 일에서 아쉬움이 남는 점은... (마크다운 문법 사용 가능)"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none overflow-hidden"
                      rows={3}
                      style={{ minHeight: '80px' }}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAddReflection}
                  disabled={!newReflectionContent.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${newReflectionContent.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <Plus className="w-4 h-4" />
                  회고 추가
                </button>
              </div>
            </div>
          </div>

          {/* 회고 목록 */}
          <div className="space-y-4">
            {currentRetrospective.reflections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg mb-2">🤔</div>
                <div>아직 회고가 없습니다.</div>
                <div className="text-sm">오늘 하루를 돌아보며 회고를 작성해보세요.</div>
              </div>
            ) : (
              currentRetrospective.reflections.map((reflection) => (
                <div key={reflection.id} className="border border-gray-200 rounded-lg p-4">
                  {editingReflection === reflection.id ? (
                    // 편집 모드
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">회고할 내용</label>
                        <textarea
                          defaultValue={reflection.content}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                          onInput={(e) => {
                            // 자동 크기 조절
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                          }}
                          onBlur={(e) => {
                            updateReflection(
                              reflection.id,
                              e.target.value,
                              reflection.goodPoints,
                              reflection.improvePoints
                            );
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateReflection(
                                reflection.id,
                                e.currentTarget.value,
                                reflection.goodPoints,
                                reflection.improvePoints
                              );
                              setEditingReflection(null);
                            }
                          }}
                          rows={3}
                          style={{ minHeight: '80px' }}
                          autoFocus
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">잘한점</label>
                          <textarea
                            defaultValue={reflection.goodPoints}
                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none overflow-hidden"
                            onInput={(e) => {
                              // 자동 크기 조절
                              e.currentTarget.style.height = 'auto';
                              e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                            }}
                            onBlur={(e) => {
                              updateReflection(
                                reflection.id,
                                reflection.content,
                                e.target.value,
                                reflection.improvePoints
                              );
                            }}
                            rows={3}
                            style={{ minHeight: '80px' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-1">아쉬운점</label>
                          <textarea
                            defaultValue={reflection.improvePoints}
                            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none overflow-hidden"
                            onInput={(e) => {
                              // 자동 크기 조절
                              e.currentTarget.style.height = 'auto';
                              e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                            }}
                            onBlur={(e) => {
                              updateReflection(
                                reflection.id,
                                reflection.content,
                                reflection.goodPoints,
                                e.target.value
                              );
                              setEditingReflection(null);
                            }}
                            rows={3}
                            style={{ minHeight: '80px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 읽기 모드
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded"
                          onClick={() => setEditingReflection(reflection.id)}
                        >
                          <MarkdownRenderer content={reflection.content} className="font-medium" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingReflection(reflection.id)}
                            className="p-1 text-gray-400 hover:text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteReflection(reflection.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-l-green-400">
                          <h5 className="text-sm font-medium text-green-700 mb-1">✅ 잘한점</h5>
                          {reflection.goodPoints ? (
                            <MarkdownRenderer content={reflection.goodPoints} className="text-sm" />
                          ) : (
                            <p className="text-gray-400 text-sm">작성되지 않음</p>
                          )}
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-l-orange-400">
                          <h5 className="text-sm font-medium text-orange-700 mb-1">🔄 아쉬운점</h5>
                          {reflection.improvePoints ? (
                            <MarkdownRenderer content={reflection.improvePoints} className="text-sm" />
                          ) : (
                            <p className="text-gray-400 text-sm">작성되지 않음</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* 4. 다음 액션 */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 다음 액션</h2>

          {/* 액션 추가 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">새 액션 아이템</label>
              <button
                onClick={() => setPreviewActionContent(!previewActionContent)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <Eye className="w-3 h-3" />
                {previewActionContent ? '편집' : '미리보기'}
              </button>
            </div>
            {previewActionContent ? (
              <div className="space-y-2">
                <div className="min-h-[60px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {newActionContent ? (
                    <MarkdownRenderer content={newActionContent} />
                  ) : (
                    <p className="text-gray-400 text-sm">내용이 없습니다.</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddAction}
                    disabled={!newActionContent.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${newActionContent.trim()
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <textarea
                  value={newActionContent}
                  onChange={(e) => {
                    setNewActionContent(e.target.value);
                    // 자동 크기 조절
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  placeholder="다음 회고까지 해볼 수 있는 구체적인 행동을 입력하세요... (마크다운 문법 사용 가능)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                  rows={2}
                  style={{ minHeight: '60px' }}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddAction()}
                />
                <button
                  onClick={handleAddAction}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium self-end"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              </div>
            )}
          </div>

          {/* 액션 목록 */}
          <div className="space-y-2">
            {currentRetrospective.nextActions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 액션 아이템이 없습니다. 다음에 시도해볼 것들을 추가해보세요.
              </div>
            ) : (
              currentRetrospective.nextActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-3 rounded-lg border ${action.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleActionItemCompletion(action.id)}
                      className="flex-shrink-0"
                    >
                      {action.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {editingAction === action.id ? (
                      <input
                        type="text"
                        defaultValue={action.description}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onBlur={(e) => {
                          updateActionItem(action.id, { description: e.target.value });
                          setEditingAction(null);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateActionItem(action.id, { description: e.currentTarget.value });
                            setEditingAction(null);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className={`flex-1 cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded ${action.completed ? 'line-through opacity-60' : ''
                          }`}
                        onClick={() => setEditingAction(action.id)}
                      >
                        <MarkdownRenderer
                          content={action.description}
                          className={`text-sm ${action.completed ? 'text-gray-500' : 'text-gray-800'
                            }`}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingAction(action.id)}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteActionItem(action.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {action.completed && action.result && (
                    <div className="mt-2 ml-8 p-2 bg-green-100 rounded">
                      <strong className="text-green-800 text-sm">결과:</strong>
                      <MarkdownRenderer content={action.result} className="text-sm text-green-800 mt-1" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RetrospectiveFeature;