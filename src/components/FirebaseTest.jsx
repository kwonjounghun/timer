import { useState } from 'react';
import { 
  testFirebaseConnection,
  simpleFirebaseTest,
  saveFocusCycle,
  getFocusCyclesByDate,
  getAllFocusCycles,
  updateFocusCycle,
  deleteFocusCycle,
  saveDailyChecklist,
  getDailyChecklistByDate,
  initializeCollections
} from '../utils/firebaseApi';

const FirebaseTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

  const handleApiCall = async (apiFunction, ...args) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('API 호출 시작:', apiFunction.name, args);
      const response = await apiFunction(...args);
      console.log('API 응답:', response);
      setResult(response);
    } catch (err) {
      console.error('API 에러:', err);
      setError({
        message: err.message,
        code: err.code,
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = () => {
    handleApiCall(testFirebaseConnection);
  };

  const testSimpleConnection = () => {
    handleApiCall(simpleFirebaseTest);
  };

  const testInitializeCollections = () => {
    handleApiCall(initializeCollections);
  };

  const testSaveFocusCycle = () => {
    const testData = {
      date: testDate,
      duration: 10,
      completed: true,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      notes: 'Firebase 테스트 사이클'
    };
    handleApiCall(saveFocusCycle, testData);
  };

  const testGetFocusCyclesByDate = () => {
    handleApiCall(getFocusCyclesByDate, testDate);
  };

  const testGetAllFocusCycles = () => {
    handleApiCall(getAllFocusCycles, 10);
  };

  const testSaveDailyChecklist = () => {
    const testData = {
      date: testDate,
      items: [
        { id: 1, text: '아침 운동', completed: false },
        { id: 2, text: '독서 30분', completed: true },
        { id: 3, text: '프로젝트 작업', completed: false }
      ],
      notes: 'Firebase 테스트 체크리스트'
    };
    handleApiCall(saveDailyChecklist, testData);
  };

  const testGetDailyChecklist = () => {
    handleApiCall(getDailyChecklistByDate, testDate);
  };

  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Firebase API 호출 중...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">오류 발생</h3>
          <div className="text-red-700 text-sm">
            <p><strong>메시지:</strong> {error.message || error}</p>
            {error.code && <p><strong>코드:</strong> {error.code}</p>}
            {error.details && (
              <details className="mt-2">
                <summary className="cursor-pointer">상세 정보</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    if (result !== null) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold mb-2">Firebase 응답</h3>
          <pre className="text-green-700 text-xs overflow-auto max-h-96 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Firebase Firestore 테스트</h2>
      
      {/* 환경변수 설정 안내 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 font-semibold mb-2">Firebase 설정 안내</h3>
        <p className="text-yellow-700 text-sm mb-2">
          .env 파일에 다음 환경변수를 설정해주세요:
        </p>
        <div className="bg-gray-100 p-2 rounded text-xs font-mono">
          VITE_FIREBASE_API_KEY=your_api_key_here<br/>
          VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com<br/>
          VITE_FIREBASE_PROJECT_ID=your_project_id<br/>
          VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com<br/>
          VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id<br/>
          VITE_FIREBASE_APP_ID=your_app_id
        </div>
      </div>

      {/* 테스트 날짜 입력 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          테스트 날짜
        </label>
        <input
          type="date"
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* API 테스트 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testSimpleConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          기본 연결 테스트
        </button>

        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          전체 연결 테스트
        </button>

        <button
          onClick={testInitializeCollections}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          컬렉션 초기화
        </button>

        <button
          onClick={testSaveFocusCycle}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          포커스 사이클 저장
        </button>

        <button
          onClick={testGetFocusCyclesByDate}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          날짜별 사이클 조회
        </button>

        <button
          onClick={testGetAllFocusCycles}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          모든 사이클 조회
        </button>

        <button
          onClick={testSaveDailyChecklist}
          disabled={isLoading}
          className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          체크리스트 저장
        </button>

        <button
          onClick={testGetDailyChecklist}
          disabled={isLoading}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          체크리스트 조회
        </button>
      </div>

      {/* 결과 표시 */}
      {renderResult()}
    </div>
  );
};

export default FirebaseTest;
