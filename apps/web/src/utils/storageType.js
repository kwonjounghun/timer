/**
 * Firebase 설정 확인 (Firebase만 사용)
 */

// Firebase 설정이 있는지 확인
const hasFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // 모든 필수 설정이 있는지 확인
  return Object.values(config).every(value => value && value !== 'your_api_key_here');
};

// Firebase 설정 확인 (항상 Firebase 사용)
export const getStorageType = () => {
  return 'firebase';
};

// 스토리지 타입 정보 반환
export const getStorageInfo = () => {
  return {
    type: 'firebase',
    isFirebase: true,
    isLocalStorage: false,
    config: hasFirebaseConfig() ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    } : null
  };
};

// 개발용 로그
if (import.meta.env.DEV) {
  const storageInfo = getStorageInfo();
  console.log('🔧 스토리지 타입:', storageInfo.type);
  console.log('📊 스토리지 정보:', storageInfo);
}
