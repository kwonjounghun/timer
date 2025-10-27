import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthContext } from '../contexts/AuthContext';

const ViewerModeIndicator: React.FC = () => {
  const { canCreate, isLocalStorageMode, isFirebaseMode } = usePermissions();
  const { user } = useAuthContext();

  // 로컬스토리지 모드이거나 편집 권한이 있으면 표시하지 않음
  if (isLocalStorageMode || canCreate) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-800">
            👀 뷰어 모드
          </span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          로그인하면 편집 가능
        </p>
      </div>
    </div>
  );
};

export default ViewerModeIndicator;
