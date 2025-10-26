import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

const UnauthorizedView: React.FC = () => {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            접근 권한이 없습니다
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            이 앱은 개인용으로 제작되어 첫 번째 로그인 사용자만 사용할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {user && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                {user.photoURL && (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName || '사용자'}
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.displayName || '사용자'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            다른 계정으로 로그인
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              이미 등록된 사용자가 있습니다.<br />
              다른 계정으로 로그인하거나 기존 사용자에게 문의하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedView;
