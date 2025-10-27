/**
 * Web 알림 서비스 구현
 * INotificationService 인터페이스의 Web Notifications API 구현
 */

import { INotificationService } from '../domain/repositories';

/**
 * Web 알림 서비스
 */
export class WebNotificationService implements INotificationService {
  /**
   * 알림 지원 여부 확인
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * 현재 권한 상태 조회
   */
  getPermissionStatus(): string {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    
    return Notification.permission;
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * 알림 표시
   */
  async showNotification(title: string, body?: string): Promise<void> {
    if (!this.isSupported()) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('알림 권한이 허용되지 않았습니다.');
      return;
    }

    try {
      const notification = new Notification(title, {
        body: body || '10분 타이머가 완료되었습니다!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'timer-completion',
        requireInteraction: false,
        silent: false
      });

      // 알림 클릭 시 포커스
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 5초 후 자동 닫기
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('알림 표시 실패:', error);
      throw new Error('알림 표시에 실패했습니다.');
    }
  }

  /**
   * 타이머 완료 알림 표시
   */
  async showTimerCompletionNotification(taskName?: string): Promise<void> {
    const title = '⏰ 타이머 완료!';
    const body = taskName ? `"${taskName}" 작업이 완료되었습니다.` : '10분 집중 시간이 완료되었습니다.';
    
    await this.showNotification(title, body);
  }

  /**
   * 권한 상태 변경 감지
   */
  onPermissionChange(callback: (permission: string) => void): () => void {
    if (!this.isSupported()) {
      return () => {};
    }

    const handlePermissionChange = () => {
      callback(Notification.permission);
    };

    // 권한 상태 변경 이벤트 리스너 등록
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then(permissionStatus => {
          permissionStatus.addEventListener('change', handlePermissionChange);
        })
        .catch(error => {
          console.warn('권한 상태 감지 설정 실패:', error);
        });
    }

    // 정리 함수 반환
    return () => {
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' as PermissionName })
          .then(permissionStatus => {
            permissionStatus.removeEventListener('change', handlePermissionChange);
          })
          .catch(() => {
            // 무시
          });
      }
    };
  }

  /**
   * 알림 설정 확인
   */
  getNotificationSettings(): {
    isSupported: boolean;
    permission: string;
    canRequest: boolean;
  } {
    const isSupported = this.isSupported();
    const permission = this.getPermissionStatus();
    const canRequest = isSupported && permission === 'default';

    return {
      isSupported,
      permission,
      canRequest
    };
  }
}

// 싱글톤 인스턴스 생성
export const webNotificationService = new WebNotificationService();
