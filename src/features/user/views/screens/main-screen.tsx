import { QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Header } from '@/common/components';
import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils';
import {
  type GetRoomNotificationButton,
  MachineList,
  MachineSectionHeader,
  SelectBuilding,
  UsingMachineList,
} from '@/features/user';

export function MainScreen({
  header,
  usingMachineList,
  selectBuilding,
  machines,
  roomNotification,
  onRegister,
  className,
  ...props
}: MainScreen.Props) {
  const { t } = useTranslation(['machine', 'main']);

  const washers = machines.machines.filter((machine) => machine.type === 'washer');
  const dryers = machines.machines.filter((machine) => machine.type === 'dryer');

  return (
    <div className={cn('bg-soft relative flex w-full flex-1 flex-col', className)} {...props}>
      <div className="px-5">
        <Header {...header} />
        <UsingMachineList
          machineList={usingMachineList.machineList}
          isNotificationEnabled={usingMachineList.isNotificationEnabled}
          notificationBlocker={usingMachineList.notificationBlocker}
          className={cn('mt-0.5', usingMachineList.className)}
        />
      </div>

      {/* 내 빨래 카드가 없으면 시트가 그 자리까지 올라온다 */}
      <div
        className={cn(
          'bg-surface rounded-t-sheet flex-1 px-5 pt-5 pb-32',
          usingMachineList.machineList.length === 0 ? 'mt-0.5' : 'mt-4',
        )}
      >
        <SelectBuilding {...selectBuilding} />
        <section className="mt-4.5">
          <MachineSectionHeader
            title={t('machine:washer')}
            machineType="washer"
            freeCount={washers.filter((i) => i.status === 'idle').length}
            roomNotification={roomNotification.washer}
            className="mb-5"
          />
          <MachineList
            machines={washers}
            onMachineLongPress={machines.onMachineLongPress}
            className={machines.className}
          />
        </section>
        <section className="mt-6.5">
          <MachineSectionHeader
            title={t('machine:dryer')}
            machineType="dryer"
            freeCount={dryers.filter((i) => i.status === 'idle').length}
            roomNotification={roomNotification.dryer}
            className="mb-5"
          />
          <MachineList
            machines={dryers}
            onMachineLongPress={machines.onMachineLongPress}
            className={machines.className}
          />
        </section>
      </div>

      {/* 엄지가 닿는 아래에 떠 있는 등록 버튼 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 mx-auto w-full max-w-120 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button size="l" onClick={onRegister} className="shadow-float pointer-events-auto w-full">
          <QrCode size={20} aria-hidden />
          {t('main:registerCta')}
        </Button>
      </div>
    </div>
  );
}

export namespace MainScreen {
  export type Props = {
    header?: Header.Props;
    usingMachineList: UsingMachineList.Props;
    selectBuilding: SelectBuilding.Props;
    machines: MachineList.Props;
    roomNotification: Record<
      GetRoomNotificationButton.MachineType,
      GetRoomNotificationButton.Props
    >;
    /** QR 스캔 시트를 연다 */
    onRegister: () => void;
    className?: string;
  };
}
