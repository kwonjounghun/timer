import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';

interface AuthUser extends User {
  isAuthorized?: boolean;
  isFirstUser?: boolean;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthorized: boolean;
  isFirstUser: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 권한 확인 (이메일 화이트리스트 방식 - Firestore 없이)
  const checkUserAuthorization = useCallback(async (user: User): Promise<AuthUser> => {
    try {
      // 허용된 이메일 목록 가져오기
      const allowedEmails =
        import.meta.env.VITE_ALLOWED_EMAILS?.split(',').map((email: string) => email.trim()) || [];

      // 사용자 이메일이 화이트리스트에 있는지 확인
      const isEmailAllowed = user.email && allowedEmails.includes(user.email);

      if (!isEmailAllowed) {
        console.log('허용되지 않은 이메일:', user.email);
        return {
          ...user,
          isAuthorized: false,
          isFirstUser: false,
        };
      }

      // 이메일이 허용된 경우 권한 부여 (Firestore 접근 없이)
      console.log('허용된 이메일로 로그인:', user.email);
      return {
        ...user,
        isAuthorized: true,
        isFirstUser: false,
      };
    } catch (error) {
      console.error('사용자 권한 확인 실패:', error);
      return {
        ...user,
        isAuthorized: false,
        isFirstUser: false,
      };
    }
  }, []);

  // 구글 로그인 (팝업 방식 사용 - 리다이렉트 URL 문제 해결)
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // 팝업 방식으로 로그인 (리다이렉트 URL 문제 없음)
      const result = await signInWithPopup(auth, googleProvider);
      console.log('팝업 로그인 성공:', result.user);
      
      // 사용자 권한 확인
      const authorizedUser = await checkUserAuthorization(result.user);
      setUser(authorizedUser);
      
    } catch (error) {
      console.error('구글 로그인 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkUserAuthorization]);

  // 로그아웃
  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }, []);

  // 인증 상태 변경 감지
  useEffect(() => {
    // 인증 상태 변경 감지
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authorizedUser = await checkUserAuthorization(firebaseUser);
        setUser(authorizedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkUserAuthorization]);

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAuthorized: user?.isAuthorized || false,
    isFirstUser: user?.isFirstUser || false,
  };
};
