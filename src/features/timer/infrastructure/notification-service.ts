import { NotificationService, NotificationPermission } from '../domain/types';

/**
 * 알림이 지원되는지 확인하는 순수 함수
 * @returns 지원 여부
 */
function checkNotificationSupport(): boolean {
  return 'Notification' in window;
}

/**
 * 현재 알림 권한 상태를 가져오는 순수 함수
 * @returns 권한 상태
 */
function getCurrentPermission(): NotificationPermission {
  if (!checkNotificationSupport()) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
}

/**
 * 알림 사운드 재생 함수
 */
function playNotificationSound(): void {
  try {
    // Web Audio API를 사용한 비프음 생성
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 800Hz 주파수로 0.5초간 재생
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  } catch (error) {
    console.log('오디오 알림 재생 실패:', error);
  }
}

/**
 * 알림 권한 요청 함수
 * @returns 권한 상태
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!checkNotificationSupport()) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return 'denied';
  }
}

/**
 * 알림 표시 함수
 * @param taskName 작업 이름 (선택사항)
 */
export async function showNotification(taskName?: string): Promise<void> {
  const isSupported = checkNotificationSupport();
  const permission = getCurrentPermission();

  if (!isSupported || permission !== 'granted') {
    console.warn('알림을 표시할 수 없습니다. 권한이 없거나 지원하지 않는 브라우저입니다.');
    return;
  }

  try {
    const title = '10분 집중 완료! 🎉';
    const body = taskName 
      ? `"${taskName}" 작업이 완료되었습니다.`
      : '집중 시간이 끝났습니다.';

    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'timer-complete',
      requireInteraction: false,
      silent: false
    });

    // 5초 후 자동 닫기
    setTimeout(() => {
      notification.close();
    }, 5000);

    // 오디오 알림 재생
    playNotificationSound();

  } catch (error) {
    console.error('알림 표시 실패:', error);
  }
}

/**
 * 알림 권한 상태 확인 함수
 * @returns 권한 상태
 */
export function getPermissionStatus(): NotificationPermission {
  return getCurrentPermission();
}

/**
 * 알림이 지원되는지 확인하는 함수
 * @returns 지원 여부
 */
export function isNotificationSupported(): boolean {
  return checkNotificationSupport();
}

/**
 * 알림 권한이 허용되었는지 확인하는 함수
 * @returns 허용 여부
 */
export function isPermissionGranted(): boolean {
  return getCurrentPermission() === 'granted';
}

/**
 * 알림 권한이 거부되었는지 확인하는 함수
 * @returns 거부 여부
 */
export function isPermissionDenied(): boolean {
  return getCurrentPermission() === 'denied';
}

/**
 * 알림 권한이 기본 상태인지 확인하는 함수
 * @returns 기본 상태 여부
 */
export function isPermissionDefault(): boolean {
  return getCurrentPermission() === 'default';
}

/**
 * 알림 서비스 객체 (함수형)
 */
export const notificationService: NotificationService = {
  permission: getCurrentPermission(),
  isSupported: checkNotificationSupport(),
  requestPermission: requestNotificationPermission,
  showNotification
};