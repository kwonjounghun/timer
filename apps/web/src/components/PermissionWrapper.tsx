import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionWrapperProps {
  children: ReactNode;
  requiredPermission: 'view' | 'create' | 'update' | 'delete';
  fallback?: ReactNode;
  showMessage?: boolean;
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  requiredPermission,
  fallback = null,
  showMessage = false
}) => {
  const permissions = usePermissions();

  const hasPermission = (() => {
    switch (requiredPermission) {
      case 'view':
        return permissions.canView;
      case 'create':
        return permissions.canCreate;
      case 'update':
        return permissions.canUpdate;
      case 'delete':
        return permissions.canDelete;
      default:
        return false;
    }
  })();

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showMessage) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-800">
            {permissions.isLocalStorageMode
              ? '로컬스토리지 모드에서는 모든 기능을 사용할 수 있습니다.'
              : '뷰어 모드입니다. 로그인하면 편집할 수 있습니다.'
            }
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default PermissionWrapper;
