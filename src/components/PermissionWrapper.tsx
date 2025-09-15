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
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-yellow-800">
            {permissions.isLocalStorageMode
              ? '로컬스토리지 모드에서는 모든 기능을 사용할 수 있습니다.'
              : '로그인이 필요합니다.'
            }
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default PermissionWrapper;
