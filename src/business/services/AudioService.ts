import { NotificationPermission } from '../types/index';

export class AudioService {
  private notificationPermission: NotificationPermission = 'default';
  private readonly isNotificationAvailable: boolean;
  private readonly notificationSound = '/notification-sound.mp3';

  constructor() {
    this.isNotificationAvailable = 'Notification' in window;
    this.init();
  }

  private init(): void {
    if (this.isNotificationAvailable) {
      this.notificationPermission = Notification.permission as NotificationPermission;
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationAvailable) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission as NotificationPermission;
      return permission as NotificationPermission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  async playNotification(taskName: string = '작업'): Promise<void> {
    if (!this.isNotificationAvailable || this.notificationPermission !== 'granted') {
      this.playBrowserNotificationSound();
      return;
    }

    try {
      const notification = new Notification('타이머 완료! 🎉', {
        body: `"${taskName}" 10분 집중이 완료되었습니다.`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'timer-complete',
        requireInteraction: true,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 10000);

      this.playNotificationSound();
    } catch (error) {
      console.error('Failed to show notification:', error);
      this.playBrowserNotificationSound();
    }
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio(this.notificationSound);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
        this.playBrowserNotificationSound();
      });
    } catch (error) {
      console.warn('Failed to create audio element:', error);
      this.playBrowserNotificationSound();
    }
  }

  private playBrowserNotificationSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play browser notification sound:', error);
    }
  }

  getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  isNotificationSupported(): boolean {
    return this.isNotificationAvailable;
  }
}