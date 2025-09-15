import { useAuthContext } from '../contexts/AuthContext';
import { getStorageType } from '../utils/storageType';

interface UsePermissionsReturn {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isLocalStorageMode: boolean;
  isFirebaseMode: boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { isAuthorized, user } = useAuthContext();
  const storageType = getStorageType();

  // 로컬스토리지 모드에서는 항상 모든 권한 허용
  const isLocalStorageMode = storageType === 'localStorage';

  // Firebase 모드에서는 인증된 사용자만 권한 허용
  const isFirebaseMode = storageType === 'firebase';

  // 권한 결정 로직
  const canView = isLocalStorageMode || isAuthorized;
  const canCreate = isLocalStorageMode || isAuthorized;
  const canUpdate = isLocalStorageMode || isAuthorized;
  const canDelete = isLocalStorageMode || isAuthorized;

  return {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    isLocalStorageMode,
    isFirebaseMode
  };
};
