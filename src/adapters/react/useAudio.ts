import { useAppContext } from './AppContextProvider';
import { NotificationPermission } from '../../business/types/index';

interface UseAudioReturn {
  notificationPermission: NotificationPermission;
  playNotification: (taskName?: string) => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  isNotificationSupported: boolean;
}

export const useAudio = (): UseAudioReturn => {
  const appContext = useAppContext();
  const audioService = appContext.audioService;
  
  return {
    notificationPermission: audioService.getNotificationPermission(),
    playNotification: (taskName) => audioService.playNotification(taskName),
    requestNotificationPermission: () => audioService.requestNotificationPermission(),
    isNotificationSupported: audioService.isNotificationSupported()
  };
};