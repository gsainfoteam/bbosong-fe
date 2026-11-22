import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button, SplashScreen } from '@/common/components';
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
  getMachineElapsedMinutes,
  getMachineRemainingDisplay,
  useFindMachines,
  useFindMyMachine,
  useFindUserProfile,
  useLiveActivitySync,
  useNowTick,
  useRefreshMainData,
} from '@/features/user/viewmodels';

import {
  type GetRoomNotificationButton,
  type MachineBox,
  type MachineList,
  type SelectBuilding,
} from '../components';
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

const toMachineStatus = (isAvailable: boolean, status: string): MachineBox.Status => {
  if (!isAvailable) return 'disabled';
  if (status === 'IDLE') return 'idle';
  return 'using';
};

export function MainFrame() {
  const navigate = useNavigate();
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

  const [isQrOpen, setIsQrOpen] = useState(false);

  const onOpenQrScan = () => setIsQrOpen(true);
  const onCloseQrScan = () => setIsQrOpen(false);

  // 일정 거리 이상 끌어내리거나 빠르게 내리면 닫는다
  const onDragEndQrScan = (_: PointerEvent, { offset, velocity }: PanInfo) => {
    if (offset.y > SHEET_CLOSE_OFFSET || velocity.y > SHEET_CLOSE_VELOCITY) onCloseQrScan();
  };

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

  const onSelectLocation = (item: Location) => setCurrentLocation(item);

  const machines = useMemo<MachineList.Item[]>(() => {
    if (!allMachines) return [];

    // 내가 등록한 기기는 아이콘에 표식을 달아 구분한다
    const mineKeys = new Set(
      usingMachines
        .filter((using) => using.location === currentLocation)
        .map((using) => `${using.machine.type}-${using.machine.id}`),
    );

    return allMachines
      .filter(
        (machine) =>
          machine.location.toLowerCase() === currentLocation &&
          machine.gender.toLowerCase() === user?.gender,
      )
      .map((machine) => {
        const status = toMachineStatus(machine.isAvailable, machine.status);

        const type: MachineBox.Type = machine.type === 'DRYER' ? 'dryer' : 'washer';

        return {
          uuid: machine.uuid,
          type,
          id: machine.index,
          status,
          elapsedMinutes: getMachineElapsedMinutes(machine.currentUsage?.startedAt, now),
          remainingDisplay: getMachineRemainingDisplay(machine),
          mine: mineKeys.has(`${type}-${machine.index}`),
        };
      })
      .sort((a, b) => a.id - b.id);
  }, [allMachines, currentLocation, now, user?.gender, usingMachines]);

  // 내 성별의 모든 세탁실 기기 상태. 내 빨래 카드의 시간과 세탁실별 빈 자리 수에 쓴다.
  const { machineStates, rooms } = useMemo(() => {
    const states = new Map<string, Omit<MachineBox.Props['machine'], 'type' | 'id' | 'mine'>>();
    const free = new Map<string, number>();

    for (const machine of allMachines ?? []) {
      if (machine.gender.toLowerCase() !== user?.gender) continue;

      const location = machine.location.toLowerCase();
      const type = machine.type === 'DRYER' ? 'dryer' : 'washer';
      const status = toMachineStatus(machine.isAvailable, machine.status);

      states.set(`${location}-${type}-${machine.index}`, {
        status,
        elapsedMinutes: getMachineElapsedMinutes(machine.currentUsage?.startedAt, now),
        remainingDisplay: getMachineRemainingDisplay(machine),
      });
      if (status === 'idle')
        free.set(`${location}-${type}`, (free.get(`${location}-${type}`) ?? 0) + 1);
    }

    return {
      machineStates: states,
      rooms: LOCATIONS.map((location) => ({
        value: location,
        washerFree: free.get(`${location}-washer`) ?? 0,
        dryerFree: free.get(`${location}-dryer`) ?? 0,
      })),
    };
  }, [allMachines, now, user?.gender]);

  // 내 빨래 카드에 보여 줄 시간·상태. 전체 기기 목록에서 같은 기기를 찾아 온다.
  const usingMachineList = {
    machineList: usingMachines.map((using) => ({
      ...using,
      state: machineStates.get(`${using.location}-${using.machine.type}-${using.machine.id}`),
    })),
    isNotificationEnabled: pushPermissionStatus === 'granted',
    notificationBlocker:
      pushPermissionStatus === 'needs-install' || pushPermissionStatus === 'unsupported'
        ? pushPermissionStatus
        : undefined,
  };

  const selectBuilding: SelectBuilding.Props = {
    value: currentLocation,
    rooms,
    gender: user?.gender ?? undefined,
    onSelect: onSelectLocation,
    disabled: isLoading,
  };

  const header = {
    onRefresh: () => void refresh(),
    isRefreshing,
  };

  // 관리자는 기기를 길게 눌러 그 기기의 등록 화면으로 바로 갈 수 있다
  const machineList: MachineList.Props = {
    machines,
    onMachineLongPress:
      user?.role === 'admin'
        ? ({ uuid }) => {
            if (!uuid) return;
            navigator.vibrate?.(15);
            void navigate({ to: '/machine-register/$machineUuid', params: { machineUuid: uuid } });
          }
        : undefined,
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
      <div className="bg-surface flex w-full flex-1 flex-col items-center justify-center">
        <p role="alert">{t('generic')}</p>
        <Button variant="outline" size="s" onClick={onRetry} className="mt-4">
          {t('refetch')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <MainScreen
        header={header}
        usingMachineList={usingMachineList}
        selectBuilding={selectBuilding}
        machines={machineList}
        onRegister={onOpenQrScan}
        roomNotification={roomNotification}
      />
      <AnimatePresence>
        {isQrOpen && (
          <>
            {/* 배경 클릭 시 닫기 */}
            <motion.div
              className="bg-ink/44 fixed inset-0"
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
              <div className="bg-track absolute top-2.5 left-1/2 h-1.25 w-9 -translate-x-1/2 rounded-full" />
              <QrScanFrame />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
