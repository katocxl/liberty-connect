import { registerDeviceToken } from '../../lib/notifications';
import { useAuthStore } from '../../store';

export const useRegisterPush = () => {
  const orgId = useAuthStore((state) => state.orgId);

  return () => registerDeviceToken({ orgId });
};
