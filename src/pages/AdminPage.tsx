import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          어드민 페이지
        </h1>
        <p className="text-gray-600 mb-4">
          이것은 어드민 페이지입니다.<br />
          로그인된 사용자만 접근 가능하며 모든 CRUD 작업이 가능합니다.
        </p>
        
        {user && (
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <p className="text-sm text-gray-600">로그인된 사용자:</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            뷰어로 이동
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
