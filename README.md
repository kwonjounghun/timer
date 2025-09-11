# Timer App

Vite 기반 React 타이머 애플리케이션입니다.

## 기능

- 10분 집중 타이머 (포모도로 기법)
- 일일 체크리스트 시스템
- 포커스 사이클 히스토리 추적
- 하이브리드 스토리지 시스템 (Firebase Firestore + 로컬스토리지)
- 반응형 디자인

## 하이브리드 스토리지 시스템

이 앱은 **하이브리드 스토리지 시스템**을 사용합니다:

- **Firebase 설정이 있는 경우**: Firebase Firestore 사용 (클라우드 동기화)
- **Firebase 설정이 없는 경우**: 로컬스토리지 사용 (오프라인 작동)

### 스토리지 타입 자동 감지
- 앱이 시작될 때 Firebase 환경변수를 확인
- 환경변수가 모두 설정되어 있으면 Firebase 사용
- 그렇지 않으면 로컬스토리지 사용
- 우측 하단에 현재 사용 중인 스토리지 타입 표시

## Firebase 설정 (선택사항)

### 1. Firebase 프로젝트 생성
1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭하여 새 프로젝트 생성
3. 프로젝트 이름: `timer-app` (또는 원하는 이름)
4. Google Analytics 사용 설정: 체크 해제

### 2. Firestore 데이터베이스 생성
1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 모드: "테스트 모드에서 시작" 선택
4. 위치: `asia-northeast3` (서울) 선택

### 3. 웹 앱 등록
1. 프로젝트 개요에서 "웹" 아이콘 클릭
2. 앱 닉네임: `timer-app-web`
3. Firebase SDK 설정: "npm" 선택
4. 앱 등록 후 설정 정보 복사

### 4. 환경변수 설정
프로젝트 루트에 `.env` 파일 생성:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```


## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 빌드:
```bash
npm run build
```

4. 미리보기:
```bash
npm run preview
```

## 기술 스택

- React 18
- Vite
- Tailwind CSS
- Firebase Firestore
- React Hooks (useState, useEffect, useCallback)
- ESLint

## GitHub Pages 배포

### 1. GitHub Pages 설정
Repository Settings → Pages에서 다음 설정:
- **Source**: GitHub Actions
- **Branch**: gh-pages (자동 생성됨)

### 2. GitHub Variables 설정 (선택사항)
Repository Settings → Secrets and variables → Actions → Variables 탭에서 다음 환경변수 설정:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 자동 배포
- `main` 브랜치에 푸시하면 자동으로 GitHub Pages에 배포
- Firebase Variables가 설정되어 있으면 Firebase 사용
- Variables가 없으면 로컬스토리지 사용

**참고**: Firebase API Key는 공개되어도 안전하지만, 더 안전하게 하려면 Secrets를 사용할 수도 있습니다.

### 4. 배포 확인
- GitHub Actions 탭에서 배포 상태 확인
- 배포 완료 후 `https://[username].github.io/[repository-name]`에서 확인
- 우측 하단 스토리지 인디케이터로 현재 사용 중인 스토리지 확인

### 5. 문제 해결
만약 배포 권한 오류가 발생하면:
1. Repository Settings → Actions → General
2. "Workflow permissions" → "Read and write permissions" 선택
3. "Allow GitHub Actions to create and approve pull requests" 체크

## 개발자 도구

- `src/utils/storageType.js`: 스토리지 타입 감지
- `src/utils/hybridStorage.js`: 하이브리드 스토리지 시스템
- `src/config/firebase.js`: Firebase 설정
- `src/utils/firebaseApi.js`: Firebase API 통신 함수들
- `src/components/StorageIndicator.jsx`: 스토리지 타입 표시 컴포넌트
