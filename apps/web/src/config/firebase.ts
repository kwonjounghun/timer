import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 디버깅: 환경변수 확인
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '설정됨' : '누락',
  authDomain: firebaseConfig.authDomain ? '설정됨' : '누락',
  projectId: firebaseConfig.projectId ? '설정됨' : '누락',
  storageBucket: firebaseConfig.storageBucket ? '설정됨' : '누락',
  messagingSenderId: firebaseConfig.messagingSenderId ? '설정됨' : '누락',
  appId: firebaseConfig.appId ? '설정됨' : '누락'
});

// Firebase 앱 초기화
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  // 구글 로그인 설정
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  // 프로덕션 환경에서 리다이렉트 URL 설정
  if (import.meta.env.PROD) {
    // 프로덕션 환경에서는 /timer/login으로 리다이렉트
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  }

  console.log('Firebase 초기화 성공');
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
  throw error;
}

export { db, auth, googleProvider };

export default app;
