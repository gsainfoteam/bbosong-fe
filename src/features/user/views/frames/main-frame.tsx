import { useNavigate } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SplashScreen } from '@/common/components';
import { haptic } from '@/common/lib/haptic';
import { ErrorPage } from '@/common/pages';
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
  useOnboarding,
  useRefreshMainData,
  type MachineView,
} from '@/features/user/viewmodels';

import { type GetRoomNotificationButton, OnboardingTour, RoomSheet } from '../components';
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
  const { t } = useTranslation('notification');

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

  useLiveActivitySync(liveActivityTargets, refetchUsingMachines);

  const {
    status: pushPermissionStatus,
    isRequesting: isRequestingPermission,
    requestPermission,
    isNative,
  } = usePushPermission();

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

  // 설치 전이거나 알림을 지원하지 않는 환경에서는 알림 안내 단계를 건너뛴다
  const livePermission =
    pushPermissionStatus === 'default' ||
    pushPermissionStatus === 'granted' ||
    pushPermissionStatus === 'denied'
      ? pushPermissionStatus
      : null;

  // 빈 기기 알림 버튼은 빈 자리가 없는 구역에만 나온다
  const isFull = (type: MachineView['type']) => {
    const machines = current.filter((view) => view.type === type);
    return machines.length > 0 && machines.every((view) => view.state !== 'idle');
  };

  const onboarding = useOnboarding({
    enabled: !isLoading && !isError,
    available: {
      machines: true,
      alert: isFull('washer') || isFull('dryer'),
      register: true,
      map: true,
      'live-activity': livePermission !== null,
    },
  });

  const onEnableNotification = async () => {
    await requestPermission();
    onboarding.finish();
  };

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
  };

  const onMachineLongPress =
    user?.role === 'admin'
      ? ({ uuid }: MachineView) => {
          haptic.medium();
          void navigate({ to: '/machine-register/$machineUuid', params: { machineUuid: uuid } });
        }
      : undefined;

  const toRoomNotification = (
    machineType: GetRoomNotificationButton.MachineType,
  ): GetRoomNotificationButton.Props => {
    const typeLabel = machineType === 'washer' ? t('laundryRoom.washer') : t('laundryRoom.dryer');

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
            ? t('laundryRoom.canceled', { type: typeLabel })
            : t('laundryRoom.requested', { type: typeLabel }),
        );
      } catch (error) {
        toast.error(
          isConflictError(error)
            ? t('laundryRoom.alreadyAvailable', { type: typeLabel })
            : t('laundryRoom.failed'),
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
    return <ErrorPage reset={onRetry} home={false} />;
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
        onMachineLongPress={onMachineLongPress}
        onRegister={onOpenQrScan}
      />
      <RoomSheet {...roomSheet} />
      <OnboardingTour
        step={onboarding.step}
        position={onboarding.position}
        total={onboarding.total}
        isLast={onboarding.isLast}
        liveSheet={{
          permission: livePermission ?? 'default',
          liveActivitySupported: onboarding.liveActivitySupported,
          isNative,
          isRequesting: isRequestingPermission,
          onEnable: () => void onEnableNotification(),
        }}
        onNext={onboarding.next}
        onFinish={onboarding.finish}
      />
    </>
  );
}
