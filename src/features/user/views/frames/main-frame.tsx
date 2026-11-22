import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SplashScreen } from '@/common/components';
import { type Gender } from '@/features/auth';
import {
  AlertGender,
  AlertLocation,
  AlertMachineType,
  useLaundryRoomAlert,
  usePushPermission,
  type LaundryRoomAlertTarget,
  type PushPermissionStatus,
} from '@/features/push-notification';
import {
  useFindMyMachine,
  useFindUserProfile,
  useLiveActivitySync,
  useMachineViews,
  useRefreshMainData,
} from '@/features/user/viewmodels';

import { type GetRoomNotificationButton, RoomSheet } from '../components';
import { MainScreen } from '../screens';
import { type Location, useRoomSelection } from './use-room-selection';

const ALERT_LOCATION: Record<Location, AlertLocation> = {
  a: AlertLocation.A,
  b: AlertLocation.B,
};

const ALERT_MACHINE_TYPE: Record<GetRoomNotificationButton.MachineType, AlertMachineType> = {
  washer: AlertMachineType.WASHER,
  dryer: AlertMachineType.DRYER,
};

const ALERT_GENDER: Record<NonNullable<Gender>, AlertGender> = {
  male: AlertGender.MALE,
  female: AlertGender.FEMALE,
};

// 이미 빈 기기가 있으면 서버가 409로 신청을 거절한다
const isConflictError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;

const toAlertBlocker = (
  canSubscribe: boolean,
  permissionStatus: PushPermissionStatus,
): GetRoomNotificationButton.Blocker | undefined => {
  if (canSubscribe) return undefined;
  // 설치 전·미지원 상태에서는 권한 요청 자체가 불가능하므로 사유를 그대로 전달한다
  if (permissionStatus === 'default' || permissionStatus === 'granted') return 'needs-permission';
  return permissionStatus;
};

export function MainFrame() {
  const { t } = useTranslation('error');
  const { t: tNotification } = useTranslation('notification');

  const {
    user,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useFindUserProfile();

  const {
    data: usingMachines,
    liveActivityTargets,
    isError: isUsingMachinesError,
    isLoading: isUsingMachinesLoading,
    refetch: refetchUsingMachines,
  } = useFindMyMachine();

  useLiveActivitySync(liveActivityTargets);

  const { status: pushPermissionStatus } = usePushPermission();

  const {
    canSubscribe,
    permissionStatus: alertPermissionStatus,
    isActive: isAlertActive,
    isPending: isAlertPending,
    toggle: toggleAlert,
  } = useLaundryRoomAlert();

  const { isRefreshing, refresh } = useRefreshMainData();

  const navigate = useNavigate();
  const onOpenQrScan = () => void navigate({ to: '/machine-register' });

  const {
    views,
    isLoading: isAllMachinesLoading,
    isError: isAllMachinesError,
    refetch: refetchAllMachines,
  } = useMachineViews(usingMachines);

  const isLoading = isUserLoading || isUsingMachinesLoading || isAllMachinesLoading;
  const isError = isUserError || isUsingMachinesError || isAllMachinesError;

  const {
    location: currentLocation,
    current,
    room,
    sheet: roomSheet,
  } = useRoomSelection(views, user?.gender);

  const myLaundry = {
    items: usingMachines.flatMap((usage) => {
      const machine = views.find((view) => view.uuid === usage.machineUuid);
      return machine
        ? [{ machine, onUnregister: usage.onUnregister, isUnregistering: usage.isUnregistering }]
        : [];
    }),
    isNotificationEnabled: pushPermissionStatus === 'granted',
    notificationBlocker:
      pushPermissionStatus === 'needs-install' || pushPermissionStatus === 'unsupported'
        ? pushPermissionStatus
        : undefined,
  };

  const header = {
    onRefresh: () => void refresh(),
    isRefreshing,
    onRegister: onOpenQrScan,
  };

  const toRoomNotification = (
    machineType: GetRoomNotificationButton.MachineType,
  ): GetRoomNotificationButton.Props => {
    const typeLabel =
      machineType === 'washer'
        ? tNotification('laundryRoom.washer')
        : tNotification('laundryRoom.dryer');

    // 성별을 모르면 어느 세탁실인지 알 수 없으므로 신청할 수 없다
    const target: LaundryRoomAlertTarget | undefined = user?.gender
      ? {
          location: ALERT_LOCATION[currentLocation],
          gender: ALERT_GENDER[user.gender],
          type: ALERT_MACHINE_TYPE[machineType],
        }
      : undefined;

    const active = target ? isAlertActive(target) : false;

    const onToggle = async () => {
      if (!target) return;

      try {
        await toggleAlert(target);
        toast.success(
          active
            ? tNotification('laundryRoom.canceled', { type: typeLabel })
            : tNotification('laundryRoom.requested', { type: typeLabel }),
        );
      } catch (error) {
        toast.error(
          isConflictError(error)
            ? tNotification('laundryRoom.alreadyAvailable', { type: typeLabel })
            : tNotification('laundryRoom.failed'),
        );
      }
    };

    return {
      machineType,
      active,
      isPending: !target || isAlertPending(target),
      blocker: toAlertBlocker(canSubscribe, alertPermissionStatus),
      onToggle,
    };
  };

  const roomNotification = {
    washer: toRoomNotification('washer'),
    dryer: toRoomNotification('dryer'),
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  const onRetry = () => {
    void refetchUser();
    void refetchUsingMachines();
    void refetchAllMachines();
  };

  if (isError) {
    return (
      <div className="bg-bg flex w-full flex-1 flex-col items-center justify-center">
        <p role="alert">{t('generic')}</p>
        <button type="button" onClick={onRetry}>
          {t('refetch')}
        </button>
      </div>
    );
  }

  return (
    <>
      <MainScreen
        header={header}
        myLaundry={myLaundry}
        room={room}
        washers={current.filter((view) => view.type === 'washer')}
        dryers={current.filter((view) => view.type === 'dryer')}
        roomNotification={roomNotification}
      />
      <RoomSheet {...roomSheet} />
    </>
  );
}
