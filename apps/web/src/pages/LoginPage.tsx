import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const { user, isAuthorized } = useAuthContext();
  const navigate = useNavigate();

  // 이미 로그인되어 있고 권한이 있다면 어드민 페이지로 리다이렉트
  useEffect(() => {
    if (user && isAuthorized) {
      navigate('/admin');
    }
  }, [user, isAuthorized, navigate]);


  // 이미 로그인되어 있으면 리다이렉트 중 표시
  if (user && isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">어드민 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
