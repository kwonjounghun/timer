import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { DateNavigationRefactored } from './components/DateNavigationRefactored';
import { TimerFeature } from './features/timer/TimerFeature';
import { DailyChecklistFeature } from './features/checklist/DailyChecklistFeature';
import { TodoFeature } from './features/todo/TodoFeature';
import { LinksFeature } from './features/links/LinksFeature';
import { ConceptMapFeature } from './features/conceptmap/ConceptMapFeature';
import StorageIndicator from './components/StorageIndicator';
import LoginForm from './components/LoginForm';
import UnauthorizedView from './components/UnauthorizedView';
import ViewerModeIndicator from './components/ViewerModeIndicator';
import { getStorageType } from './utils/storageType';

type ActiveSection = 'timer' | 'checklist' | 'todo' | 'links' | 'conceptmap';

const AppContent: React.FC = () => {
  const { user, loading, isAuthorized } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('timer');

  const storageType = getStorageType();
  const isLocalStorageMode = storageType === 'localStorage';

  // URL 쿼리파라미터에서 섹션 읽기
  useEffect(() => {
    const updateSectionFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section') as ActiveSection;
      if (section && (section === 'timer' || section === 'checklist' || section === 'todo' || section === 'links' || section === 'conceptmap')) {
        setActiveSection(section);
      }
    };

    // 초기 로드 시 URL에서 섹션 읽기
    updateSectionFromURL();

    // 브라우저 뒤로가기/앞으로가기 지원
    window.addEventListener('popstate', updateSectionFromURL);

    return () => {
      window.removeEventListener('popstate', updateSectionFromURL);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);

    // URL 쿼리파라미터 업데이트
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  // 초기 로드 시 기본 섹션 설정 (URL에 섹션이 없는 경우)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('section')) {
      const url = new URL(window.location.href);
      url.searchParams.set('section', 'timer');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // 페이지 제목을 활성 섹션에 따라 업데이트
  useEffect(() => {
    const sectionTitles = {
      timer: '10분 집중 타이머',
      checklist: '일일 점검 시스템',
      todo: '할 일 관리',
      links: '문서 링크 관리',
      conceptmap: '컨셉맵 링크 관리'
    };
    document.title = `${sectionTitles[activeSection]} - Timer App`;
  }, [activeSection]);


  const clearAllData = async () => {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Firebase 모드에서 로그인했지만 권한이 없는 경우
  if (storageType === 'firebase' && user && !isAuthorized) {
    return <UnauthorizedView />;
  }

  // 기본 앱 화면 (뷰어 모드로 시작, 로그인 시 편집 권한 부여)
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main content area */}
      <div className={`transition-all duration-300 ${isSidebarOpen
        ? isSidebarCollapsed
          ? 'lg:ml-16'
          : 'lg:ml-60'
        : 'ml-0'
        }`}>
        <DateNavigationRefactored
          onClearAllData={clearAllData}
        />

        <div className="p-6">
          {activeSection === 'timer' && (
            <div className="max-w-6xl mx-auto">
              <TimerFeature />
            </div>
          )}

          {activeSection === 'checklist' && (
            <div className="max-w-4xl mx-auto">
              <DailyChecklistFeature />
            </div>
          )}

          {activeSection === 'todo' && (
            <div className="max-w-4xl mx-auto">
              <TodoFeature />
            </div>
          )}

          {activeSection === 'links' && (
            <div className="max-w-4xl mx-auto">
              <LinksFeature />
            </div>
          )}

          {activeSection === 'conceptmap' && (
            <ConceptMapFeature />
          )}
        </div>
      </div>

      <StorageIndicator />
      <ViewerModeIndicator />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;