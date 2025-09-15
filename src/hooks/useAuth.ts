import { useState, useEffect, useCallback } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

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

  // 사용자 권한 확인
  const checkUserAuthorization = useCallback(async (user: User): Promise<AuthUser> => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // 기존 사용자
        const userData = userDoc.data();
        return {
          ...user,
          isAuthorized: true,
          isFirstUser: userData.isFirstUser || false
        };
      } else {
        // 새 사용자 - 첫 번째 사용자인지 확인
        const usersCollectionRef = doc(db, 'system', 'userCount');
        const usersDoc = await getDoc(usersCollectionRef);

        const isFirstUser = !usersDoc.exists() || usersDoc.data()?.count === 0;

        if (isFirstUser) {
          // 첫 번째 사용자로 등록
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isFirstUser: true,
            isAuthorized: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          // 사용자 카운트 업데이트
          await setDoc(usersCollectionRef, {
            count: 1,
            firstUserId: user.uid,
            updatedAt: serverTimestamp()
          });

          return {
            ...user,
            isAuthorized: true,
            isFirstUser: true
          };
        } else {
          // 첫 번째 사용자가 아닌 경우 - 권한 없음
          return {
            ...user,
            isAuthorized: false,
            isFirstUser: false
          };
        }
      }
    } catch (error) {
      console.error('사용자 권한 확인 실패:', error);
      return {
        ...user,
        isAuthorized: false,
        isFirstUser: false
      };
    }
  }, []);

  // 구글 로그인
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
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
    isFirstUser: user?.isFirstUser || false
  };
};
