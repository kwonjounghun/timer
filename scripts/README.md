# 마이그레이션 스크립트

## focus_cycles → timer_sessions 마이그레이션

기존 `focus_cycles` 컬렉션의 데이터를 새로운 `timer_sessions` 컬렉션으로 마이그레이션합니다.

## 실행 방법

### 1. Firebase 서비스 계정 키 설정

Firebase 콘솔에서 서비스 계정 키를 다운로드:

1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택
3. 프로젝트 설정 (⚙️) → 서비스 계정 탭
4. "새 비공개 키 생성" 클릭
5. 다운로드된 JSON 파일을 프로젝트 루트에 `serviceAccount.json`으로 저장

### 2. 스크립트 실행

```bash
node scripts/migrateToTimerSessions.js
```

## 데이터 변환

`focus_cycles` → `timer_sessions`

| focus_cycles | timer_sessions              |
| ------------ | --------------------------- |
| task         | task                        |
| startTime    | startTime                   |
| endTime      | endTime                     |
| timeSpent    | duration                    |
| date         | date                        |
| result       | reflection.result           |
| distractions | reflection.distractions     |
| thoughts     | reflection.thoughts         |
| -            | reflection.rating (새 필드) |
| createdAt    | createdAt                   |
| updatedAt    | updatedAt                   |

## 주의사항

- 이 스크립트는 기존 `focus_cycles` 데이터를 삭제하지 않습니다
- `timer_sessions` 컬렉션에 새 데이터를 추가만 합니다
- 중복 실행 시 중복 데이터가 생성될 수 있습니다
- 마이그레이션 전 백업을 권장합니다
