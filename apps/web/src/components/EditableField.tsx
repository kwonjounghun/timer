import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface EditableFieldProps {
  children: ReactNode;
  fallback?: ReactNode;
  showViewerMessage?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  children,
  fallback,
  showViewerMessage = true
}) => {
  const { canCreate } = usePermissions();

  if (canCreate) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showViewerMessage) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
          <div className="text-center p-2">
            <div className="text-sm text-gray-600 mb-1">👀 뷰어 모드</div>
            <div className="text-xs text-gray-500">로그인하면 편집 가능</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EditableField;
