import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { useTranslation } from 'react-i18next';

import {
  useFindMachines,
  useFindMachinesByUuids,
  useFindMyMachine,
  useFindUserProfile,
} from '@/features/user/viewmodels';

import { type MachineBox } from '../components';
import { MainScreen } from '../screens';
import { QrScanFrame } from './qr-scan-frame';

const SHEET_CLOSE_OFFSET = 120;
const SHEET_CLOSE_VELOCITY = 500;

const LOCATIONS = ['a', 'b'] as const;

type Location = (typeof LOCATIONS)[number];

const isLocation = (value: unknown): value is Location => LOCATIONS.includes(value as Location);

const toMachineStatus = (isAvailable: boolean, status: string): MachineBox.Status => {
  if (!isAvailable) return 'disabled';
  if (status === 'IDLE') return 'idle';
  return 'using';
};

export function MainFrame() {
  const { t } = useTranslation('error');

  const {
    user,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useFindUserProfile();

  const {
    data: usingMachines,
    isError: isUsingMachinesError,
    isLoading: isUsingMachinesLoading,
    refetch: refetchUsingMachines,
  } = useFindMyMachine();

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

  const usingMachineUuids = useMemo(
    () =>
      (allMachines ?? [])
        .filter((machine) => machine.status !== 'IDLE')
        .map((machine) => machine.uuid),
    [allMachines],
  );

  const { machineByUuid: usingMachineDetailByUuid } = useFindMachinesByUuids(usingMachineUuids);

  useEffect(() => {
    localStorage.setItem('location', currentLocation);
  }, [currentLocation]);

  const isLoading = isUserLoading || isUsingMachinesLoading || isAllMachinesLoading;
  const isError = isUserError || isUsingMachinesError || isAllMachinesError;

  const onSelectLocation = (item: string) => {
    if (isLocation(item)) setCurrentLocation(item);
  };

  const machines = useMemo<MachineBox.Props['machine'][]>(() => {
    if (!allMachines) return [];

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
          type,
          id: machine.index,
          status,
          elapsedMinutes: usingMachineDetailByUuid.get(machine.uuid)?.currentUsage?.durationMinutes,
        };
      })
      .sort((a, b) => a.id - b.id);
  }, [allMachines, currentLocation, usingMachineDetailByUuid, user?.gender]);

  const usingMachineList = {
    machineList: usingMachines,
    onAdd: onOpenQrScan,
  };

  const selectBuilding = {
    dropDownProps: {
      items: [...LOCATIONS],
      value: currentLocation,
      onSelect: onSelectLocation,
      disabled: isLoading,
    },
  };

  const machineList = {
    machines,
  };

  if (isLoading) {
    return (
      <div className="bg-bg flex h-dvh w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const onRetry = () => {
    void refetchUser();
    void refetchUsingMachines();
    void refetchAllMachines();
  };

  if (isError) {
    return (
      <div className="bg-bg flex h-dvh w-full flex-col items-center justify-center">
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
        usingMachineList={usingMachineList}
        selectBuilding={selectBuilding}
        machines={machineList}
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
