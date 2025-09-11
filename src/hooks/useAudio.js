import { useEffect, useRef, useState } from 'react';

export const useAudio = () => {
  const audioRef = useRef(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const createBeep = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    audioRef.current = createBeep;

    // 알림 권한 상태 확인
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }

    return false;
  };

  // 브라우저 알림 표시
  const showNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico', // 앱 아이콘
        badge: '/favicon.ico',
        tag: 'timer-notification', // 같은 태그의 알림은 하나만 표시
        requireInteraction: true, // 사용자가 클릭할 때까지 알림 유지
        ...options
      });

      // 알림 클릭 시 창에 포커스
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 5초 후 자동으로 알림 닫기
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } else {
      console.log('알림 권한이 허용되지 않았습니다.');
    }
  };

  const playNotification = (taskName = '작업') => {
    // 사운드 알림 재생
    if (audioRef.current) {
      audioRef.current();
    }

    // 브라우저 알림 표시
    showNotification('⏰ 10분 집중 타이머 완료!', {
      body: `"${taskName}" 작업이 완료되었습니다. 회고를 작성해보세요!`,
      icon: '/favicon.ico'
    });
  };

  return { 
    playNotification, 
    requestNotificationPermission, 
    showNotification,
    notificationPermission 
  };
};
