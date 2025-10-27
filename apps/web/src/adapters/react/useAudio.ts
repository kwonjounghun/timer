import { useState, useCallback, useEffect } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface UseAudioReturn {
  notificationPermission: NotificationPermission;
  playNotification: (taskName?: string) => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  isNotificationSupported: boolean;
}

export const useAudio = (): UseAudioReturn => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check if notifications are supported
  const isNotificationSupported = 'Notification' in window;

  // Check current permission on mount
  useEffect(() => {
    if (isNotificationSupported) {
      setNotificationPermission(Notification.permission as NotificationPermission);
    }
  }, [isNotificationSupported]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      const newPermission = permission as NotificationPermission;
      setNotificationPermission(newPermission);
      return newPermission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [isNotificationSupported]);

  // Play notification
  const playNotification = useCallback(async (taskName?: string): Promise<void> => {
    if (!isNotificationSupported || notificationPermission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification('10분 집중 완료! 🎉', {
        body: taskName ? `"${taskName}" 작업이 완료되었습니다.` : '집중 시간이 끝났습니다.',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'timer-complete',
        requireInteraction: false,
        silent: false
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Play system sound if available
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (audioError) {
          console.log('Audio notification not available:', audioError);
        }
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, [isNotificationSupported, notificationPermission]);

  return {
    notificationPermission,
    playNotification,
    requestNotificationPermission,
    isNotificationSupported
  };
};