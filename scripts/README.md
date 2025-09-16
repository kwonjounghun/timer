# Firebase 일일 체크리스트 중복 제거 스크립트

Firebase의 일일 체크리스트 컬렉션에서 같은 날짜의 중복 데이터를 찾아 가장 최신 데이터만 남기고 나머지를 제거하는 스크립트입니다.

## 사용법

### 1. 의존성 설치
먼저 dotenv 패키지를 설치합니다:
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트의 `.env` 파일에 Firebase 설정이 있는지 확인합니다:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 스크립트 실행

#### 3.1 DRY RUN (시뮬레이션)
실제로 삭제하지 않고 어떤 데이터가 삭제될지만 확인:
```bash
npm run clean-duplicates
```
또는
```bash
node scripts/cleanDuplicateChecklists.js
```

#### 3.2 실제 삭제 실행
중복 데이터를 실제로 삭제:
```bash
npm run clean-duplicates:execute
```
또는
```bash
node scripts/cleanDuplicateChecklists.js --execute
```

## 스크립트 동작 방식

1. **데이터 조회**: Firebase의 `daily_checklists` 컬렉션에서 모든 데이터를 조회합니다.

2. **중복 감지**: 같은 `date` 필드를 가진 문서들을 찾습니다.

3. **최신 데이터 선택**: 각 날짜별로 `updatedAt` 또는 `createdAt` 기준으로 가장 최신 데이터를 선택합니다.

4. **중복 삭제**: 최신 데이터를 제외한 나머지 중복 데이터를 삭제합니다.

## 안전 기능

- **DRY RUN 모드**: 기본적으로 실제 삭제하지 않고 시뮬레이션만 실행
- **상세한 로깅**: 어떤 데이터가 유지되고 삭제되는지 상세히 출력
- **오류 처리**: 개별 삭제 실패 시에도 다른 작업은 계속 진행

## 출력 예시

```
🚀 일일 체크리스트 중복 제거 스크립트를 시작합니다...

📋 일일 체크리스트 데이터를 조회합니다...
✅ 총 25개의 체크리스트 데이터를 찾았습니다.

🔍 중복 데이터를 찾는 중...
📅 2024-01-15: 3개의 중복 데이터 발견
  📌 유지할 데이터: abc123 (2024-01-15T10:30:00.000Z)
  🗑️  삭제할 데이터: def456 (2024-01-15T09:15:00.000Z)
  🗑️  삭제할 데이터: ghi789 (2024-01-15T08:00:00.000Z)

🎯 총 2개의 중복 데이터를 삭제해야 합니다.

🔍 DRY RUN 모드: 실제로 삭제하지 않고 시뮬레이션만 진행합니다.
📊 삭제될 데이터 목록:
  1. ID: def456, Date: 2024-01-15
  2. ID: ghi789, Date: 2024-01-15

💡 실제 삭제를 원하시면 스크립트를 dryRun=false로 실행하세요.

🏁 스크립트 실행이 완료되었습니다.
```

## 주의사항

⚠️ **중요**: 실제 삭제를 실행하기 전에 반드시 DRY RUN을 먼저 실행하여 결과를 확인하세요.

⚠️ **백업**: 중요한 데이터가 있다면 실행 전에 Firebase 백업을 권장합니다.