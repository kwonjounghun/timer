import React from 'react';
import { Link } from 'react-router-dom';

const ViewerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          공개 뷰어 페이지
        </h1>
        <p className="text-gray-600 mb-6">
          이것은 공개 뷰어 페이지입니다.<br />
          로그인 없이 읽기 전용 데이터를 확인할 수 있습니다.
        </p>
        <div className="space-y-3">
          <Link
            to="/timer"
            className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            ⏰ 10분 타이머
          </Link>
          <Link
            to="/admin"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            어드민으로 이동
          </Link>
          <Link
            to="/login"
            className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewerPage;
