import { Timer, Calendar, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: 'timer' | 'checklist';
  onSectionChange: (section: 'timer' | 'checklist') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  activeSection,
  onSectionChange,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) => {
  const menuItems = [
    {
      id: 'timer' as const,
      label: '10분 집중 타이머',
      icon: Timer,
      description: '포모도로 타이머 & 집중 사이클 기록'
    },
    {
      id: 'checklist' as const,
      label: '일일 점검 시스템',
      icon: Calendar,
      description: '하루 계획 & 회고'
    }
  ];

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-2xl z-[60] transition-all duration-300 ease-in-out border-r border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-60'} w-80
      `}>
        {/* 헤더 */}
        <div className={`border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 ${isCollapsed ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">생산성 도구</h1>
                <p className="text-blue-100 text-xs mt-1">시간 관리 도구</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* 데스크톱 접기/펼치기 버튼 */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:block text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              )}

              {/* 모바일 닫기 버튼 */}
              <button
                onClick={onToggle}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors lg:hidden"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 메뉴 항목들 */}
        <div className={isCollapsed ? 'p-2' : 'p-4'}>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    // 모바일에서는 메뉴 선택 후 사이드바 닫기
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    w-full rounded-xl transition-all duration-200 text-left group relative
                    ${isCollapsed ? 'p-3 flex justify-center' : 'p-3'}
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  {isCollapsed ? (
                    // 접힌 상태: 아이콘만 표시
                    <>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-blue-500'} />
                      {/* 호버 시 툴팁 */}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>
                    </>
                  ) : (
                    // 펼쳐진 상태: 전체 메뉴 표시
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={isActive ? 'text-white' : 'text-blue-500'} />
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 하단 정보 */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <p className="mb-1">🎯 집중력 향상</p>
              <p>생산성 도구</p>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={onToggle}
        className={`
          fixed top-4 left-4 z-[100] p-3 bg-white shadow-lg rounded-xl border border-gray-200
          transition-all duration-300 lg:hidden
          ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      >
        <Menu size={20} className="text-gray-600" />
      </button>
    </>
  );
};