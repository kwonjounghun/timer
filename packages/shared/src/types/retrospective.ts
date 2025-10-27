// ==================== 간단한 회고 데이터 모델 ====================

/**
 * 회고 항목 - 회고할 내용과 그에 대한 잘한점/아쉬운점
 */
export interface ReflectionItem {
  id: string;
  content: string;           // 회고할 내용 (무엇에 대한 회고인지)
  goodPoints: string;        // 잘한점
  improvePoints: string;     // 아쉬운점
  createdAt: Date;
}

/**
 * 액션 아이템 - 다음 회고까지 해볼 수 있는 것들
 */
export interface ActionItem {
  id: string;
  description: string;       // 구체적인 행동
  completed?: boolean;       // 다음 회고에서 점검용
  result?: string;           // 실행 결과 (다음 회고에서 기록)
  createdAt: Date;
}

/**
 * 이전 목표 점검
 */
export interface PreviousGoalCheck {
  content: string;           // 이전 목표 점검 내용 (텍스트)
}

/**
 * 일일 회고
 */
export interface DailyRetrospective {
  // 기본 정보
  id: string;
  date: string;              // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;

  // 1. 📋 지난 목표 점검 (Previous Goals Check)
  // 가치: 연속성 확보, 약속한 것에 대한 책임감, 패턴 학습
  previousGoalCheck?: PreviousGoalCheck;

  // 2. 📝 오늘의 기록 (Daily Journal)
  // 가치: 객관적 사실 정리, 감정과 분석의 분리, 미래 참고자료
  dailyJournal: {
    content: string;         // 하루 전체 기록 (통으로 작성)
  };

  // 3. 🤔 오늘의 회고 (Today's Reflections)
  // 가치: 패턴 인식, 자기 객관화, 개선점 발견
  reflections: ReflectionItem[];  // 여러 개 추가 가능

  // 4. 🎯 다음 액션 (Next Actions)
  // 가치: 구체적 실행계획, 다음 회고와의 연결고리, 성장 추진력
  nextActions: ActionItem[];

  // 5. 🏷️ 태그 (선택사항)
  tags?: string[];           // 검색/분류용 태그
}

/**
 * 회고 요약 (목록 표시용)
 */
export interface RetrospectiveSummary {
  id: string;
  date: string;
  summary: string;           // dailyJournal.summary
  reflectionCount: number;   // 회고 항목 개수
  actionCount: number;       // 액션 아이템 개수
  completedActions: number;  // 완료된 액션 개수
  tags: string[];
}

// ==================== 헬퍼 타입들 ====================

export type CreateRetrospectiveInput = Omit<DailyRetrospective, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRetrospectiveInput = Partial<Omit<DailyRetrospective, 'id' | 'createdAt'>>;