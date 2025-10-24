/**
 * Firebase 세션 저장소 구현
 * ISessionRepository 인터페이스의 Firebase Firestore 구현
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { ISessionRepository } from '../domain/repositories';
import { TimerSession, SessionFilter, SessionSort, SessionStats, DailyStats } from '../domain/types';

/**
 * Firebase 세션 저장소
 */
export class FirebaseSessionRepository implements ISessionRepository {
  private readonly collectionName = 'timerSessions';

  /**
   * Firestore 데이터를 도메인 객체로 변환
   */
  private toDomain(firestoreData: any): TimerSession {
    return {
      id: firestoreData.id,
      task: firestoreData.task,
      startTime: firestoreData.startTime.toDate(),
      endTime: firestoreData.endTime.toDate(),
      duration: firestoreData.duration,
      result: firestoreData.result || '',
      distractions: firestoreData.distractions || '',
      thoughts: firestoreData.thoughts || '',
      date: firestoreData.date
    };
  }

  /**
   * 도메인 객체를 Firestore 데이터로 변환
   */
  private toFirestore(session: TimerSession): any {
    return {
      task: session.task,
      startTime: Timestamp.fromDate(session.startTime),
      endTime: Timestamp.fromDate(session.endTime),
      duration: session.duration,
      result: session.result,
      distractions: session.distractions,
      thoughts: session.thoughts,
      date: session.date
    };
  }

  /**
   * 세션 저장
   */
  async saveSession(session: TimerSession): Promise<string> {
    try {
      const sessionData = this.toFirestore(session);
      const docRef = await addDoc(collection(db, this.collectionName), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('세션 저장 실패:', error);
      throw new Error('세션 저장에 실패했습니다.');
    }
  }

  /**
   * 특정 날짜의 세션들 조회
   */
  async getSessionsByDate(date: string): Promise<TimerSession[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('date', '==', date),
        orderBy('startTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.toDomain({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('날짜별 세션 조회 실패:', error);
      throw new Error('날짜별 세션 조회에 실패했습니다.');
    }
  }

  /**
   * 모든 세션 조회
   */
  async getAllSessions(limitCount?: number): Promise<TimerSession[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('startTime', 'desc')
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.toDomain({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('전체 세션 조회 실패:', error);
      throw new Error('전체 세션 조회에 실패했습니다.');
    }
  }

  /**
   * 세션 업데이트
   */
  async updateSession(id: string, updates: Partial<TimerSession>): Promise<void> {
    try {
      const sessionRef = doc(db, this.collectionName, id);
      const updateData: any = {};
      
      if (updates.task !== undefined) updateData.task = updates.task;
      if (updates.startTime !== undefined) updateData.startTime = Timestamp.fromDate(updates.startTime);
      if (updates.endTime !== undefined) updateData.endTime = Timestamp.fromDate(updates.endTime);
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.memo !== undefined) updateData.memo = updates.memo;
      if (updates.date !== undefined) updateData.date = updates.date;
      
      await updateDoc(sessionRef, updateData);
    } catch (error) {
      console.error('세션 업데이트 실패:', error);
      throw new Error('세션 업데이트에 실패했습니다.');
    }
  }

  /**
   * 세션 삭제
   */
  async deleteSession(id: string): Promise<void> {
    try {
      const sessionRef = doc(db, this.collectionName, id);
      await deleteDoc(sessionRef);
    } catch (error) {
      console.error('세션 삭제 실패:', error);
      throw new Error('세션 삭제에 실패했습니다.');
    }
  }

  /**
   * 세션 필터링 및 정렬
   */
  async getSessions(filter?: SessionFilter, sort?: SessionSort): Promise<TimerSession[]> {
    try {
      let q = query(collection(db, this.collectionName));
      
      // 필터 적용
      if (filter?.date) {
        q = query(q, where('date', '==', filter.date));
      }
      
      if (filter?.dateRange) {
        q = query(
          q,
          where('date', '>=', filter.dateRange.start),
          where('date', '<=', filter.dateRange.end)
        );
      }
      
      // 정렬 적용
      if (sort) {
        const orderField = sort.field === 'duration' ? 'duration' : 
                          sort.field === 'startTime' ? 'startTime' : 'endTime';
        q = query(q, orderBy(orderField, sort.direction));
      } else {
        q = query(q, orderBy('startTime', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.toDomain({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('세션 필터링/정렬 조회 실패:', error);
      throw new Error('세션 조회에 실패했습니다.');
    }
  }

  /**
   * 세션 통계 조회
   */
  async getSessionStats(filter?: SessionFilter): Promise<SessionStats> {
    try {
      const sessions = await this.getSessions(filter);
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          totalTime: 0,
          averageTime: 0,
          longestSession: null,
          shortestSession: null
        };
      }
      
      const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
      const averageTime = totalTime / sessions.length;
      
      const longestSession = sessions.reduce((longest, current) => 
        current.duration > longest.duration ? current : longest
      );
      
      const shortestSession = sessions.reduce((shortest, current) => 
        current.duration < shortest.duration ? current : shortest
      );
      
      return {
        totalSessions: sessions.length,
        totalTime,
        averageTime,
        longestSession,
        shortestSession
      };
    } catch (error) {
      console.error('세션 통계 조회 실패:', error);
      throw new Error('세션 통계 조회에 실패했습니다.');
    }
  }

  /**
   * 날짜별 통계 조회
   */
  async getDailyStats(date: string): Promise<DailyStats> {
    try {
      const sessions = await this.getSessionsByDate(date);
      
      if (sessions.length === 0) {
        return {
          date,
          sessionCount: 0,
          totalTime: 0,
          averageTime: 0,
          firstSessionTime: null,
          lastSessionTime: null
        };
      }
      
      const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
      const averageTime = totalTime / sessions.length;
      
      const sortedByStartTime = sessions.sort((a, b) => 
        a.startTime.getTime() - b.startTime.getTime()
      );
      
      const firstSession = sortedByStartTime[0];
      const lastSession = sortedByStartTime[sortedByStartTime.length - 1];
      
      return {
        date,
        sessionCount: sessions.length,
        totalTime,
        averageTime,
        firstSessionTime: firstSession ? firstSession.startTime.toLocaleTimeString('ko-KR') : null,
        lastSessionTime: lastSession ? lastSession.endTime.toLocaleTimeString('ko-KR') : null
      };
    } catch (error) {
      console.error('날짜별 통계 조회 실패:', error);
      throw new Error('날짜별 통계 조회에 실패했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const firebaseSessionRepository = new FirebaseSessionRepository();
