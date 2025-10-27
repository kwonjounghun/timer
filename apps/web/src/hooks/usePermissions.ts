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
  // 뷰어 모드: 항상 허용 (로컬스토리지 모드이거나 Firebase 모드에서 로그인 여부와 관계없이)
  const canView = true;

  // 편집 권한: 로컬스토리지 모드이거나 Firebase 모드에서 인증된 사용자만
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
