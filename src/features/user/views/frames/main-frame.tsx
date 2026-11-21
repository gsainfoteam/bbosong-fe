import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion, type PanInfo } from 'motion/react';
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
  toMachineView,
  useFindMachines,
  useFindMyMachine,
  useFindUserProfile,
  useLiveActivitySync,
  useNowTick,
  useRefreshMainData,
} from '@/features/user/viewmodels';

import { type GetRoomNotificationButton, RoomSheet } from '../components';
import { MainScreen } from '../screens';
import { QrScanFrame } from './qr-scan-frame';

const SHEET_CLOSE_OFFSET = 120;
const SHEET_CLOSE_VELOCITY = 500;

const LOCATIONS = ['a', 'b'] as const;

type Location = (typeof LOCATIONS)[number];

const isLocation = (value: unknown): value is Location => LOCATIONS.includes(value as Location);

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
  const { t: tMain } = useTranslation(['main', 'location']);

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

  const [isQrOpen, setIsQrOpen] = useState(false);

  const onOpenQrScan = () => setIsQrOpen(true);
  const onCloseQrScan = () => setIsQrOpen(false);

  // 일정 거리 이상 끌어내리거나 빠르게 내리면 닫는다
  const onDragEndQrScan = (_: PointerEvent, { offset, velocity }: PanInfo) => {
    if (offset.y > SHEET_CLOSE_OFFSET || velocity.y > SHEET_CLOSE_VELOCITY) onCloseQrScan();
  };

  const [isRoomSheetOpen, setIsRoomSheetOpen] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<Location>(() => {
    const savedLocation = localStorage.getItem('location');
    return isLocation(savedLocation) ? savedLocation : 'a';
  });

  const {
    data: allMachines,
    isLoading: isAllMachinesLoading,
    isError: isAllMachinesError,
    refetch: refetchAllMachines,
  } = useFindMachines();

  const hasUsingMachines = useMemo(
    () => (allMachines ?? []).some((machine) => machine.status !== 'IDLE'),
    [allMachines],
  );
  const now = useNowTick(hasUsingMachines);

  useEffect(() => {
    localStorage.setItem('location', currentLocation);
  }, [currentLocation]);

  const isLoading = isUserLoading || isUsingMachinesLoading || isAllMachinesLoading;
  const isError = isUserError || isUsingMachinesError || isAllMachinesError;

  const onSelectLocation = (item: string) => {
    if (isLocation(item)) setCurrentLocation(item);
    setIsRoomSheetOpen(false);
  };

  const views = useMemo(() => {
    const mine = new Set(usingMachines.map((usage) => usage.machineUuid));
    return (allMachines ?? [])
      .map((machine) => toMachineView(machine, now, mine))
      .sort((a, b) => a.id - b.id);
  }, [allMachines, usingMachines, now]);

  // 성별마다 세탁실이 따로라, 내 성별의 A동·B동만 고른다.
  const roomViews = (location: Location) =>
    views.filter((view) => view.location === location && view.gender === user?.gender);
  const current = roomViews(currentLocation);

  const roomLabel = (location: Location) =>
    tMain('roomTile', {
      location: tMain(location === 'a' ? 'location:a_long' : 'location:b_long'),
      gender: user?.gender === 'female' ? tMain('female') : tMain('male'),
    });

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

  const room = {
    title: tMain('roomTitle', {
      location: tMain(currentLocation === 'a' ? 'location:a_long' : 'location:b_long'),
      gender: user?.gender === 'female' ? tMain('female') : tMain('male'),
    }),
    onOpen: () => setIsRoomSheetOpen(true),
  };

  const rooms: RoomSheet.Room[] = LOCATIONS.map((location) => {
    const list = roomViews(location);
    const freeOf = (type: string) =>
      list.filter((view) => view.type === type && view.state === 'idle').length;
    return {
      location,
      label: roomLabel(location),
      freeWashers: freeOf('washer'),
      freeDryers: freeOf('dryer'),
      selected: location === currentLocation,
    };
  });

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
      <RoomSheet
        open={isRoomSheetOpen}
        rooms={rooms}
        onSelect={onSelectLocation}
        onClose={() => setIsRoomSheetOpen(false)}
      />
      <AnimatePresence>
        {isQrOpen && (
          <>
            {/* 배경 클릭 시 닫기 */}
            <motion.div
              className="fixed inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseQrScan}
            />
            {/* QrScanFrame은 마운트 시 카메라를 켜고 언마운트 시 끈다 */}
            <motion.div
              className="fixed inset-x-0 bottom-0 mx-auto max-w-120 touch-none"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 1 }}
              onDragEnd={onDragEndQrScan}
            >
              <div className="bg-border absolute top-5 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full" />
              <QrScanFrame />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
