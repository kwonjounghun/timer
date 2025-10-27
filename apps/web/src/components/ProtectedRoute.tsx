import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAuthorized } = useAuthContext();

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

  // 로그인되지 않았거나 권한이 없는 경우 로그인 페이지로 리다이렉트
  if (!user || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 사용자만 접근 가능
  return <>{children}</>;
};

export default ProtectedRoute;
