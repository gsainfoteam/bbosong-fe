import { useTranslation } from 'react-i18next';

import { Header } from '@/common/components';
import { cn } from '@/common/utils';
import {
  GetRoomNotificationButton,
  MachineList,
  SelectBuilding,
  UsingMachineList,
} from '@/features/user';

export function MainScreen({
  header,
  usingMachineList,
  selectBuilding,
  machines,
  roomNotification,
  className,
  ...props
}: MainScreen.Props) {
  const { t } = useTranslation(['machine']);

  const washers = machines.machines.filter((machine) => machine.type === 'washer');
  const dryers = machines.machines.filter((machine) => machine.type === 'dryer');

  return (
    <div className={cn(className, 'bg-bg w-full')} {...props}>
      <Header {...header} className={cn('mb-6', header?.className)} />
      <div className="flex flex-col gap-6 px-3">
        <UsingMachineList
          machineList={usingMachineList.machineList}
          isNotificationEnabled={usingMachineList.isNotificationEnabled}
          notificationBlocker={usingMachineList.notificationBlocker}
          onAdd={usingMachineList.onAdd}
          className={usingMachineList.className}
        />
        <SelectBuilding
          dropDownProps={selectBuilding.dropDownProps}
          className={selectBuilding.className}
        />
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p>{t('washer')}</p>
            {washers.filter((i) => i.status === 'idle').length === 0 && (
              <GetRoomNotificationButton {...roomNotification.washer} />
            )}
          </div>
          <MachineList machines={washers} className={machines.className} />
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p>{t('dryer')}</p>
            {dryers.filter((i) => i.status === 'idle').length === 0 && (
              <GetRoomNotificationButton {...roomNotification.dryer} />
            )}
          </div>
          <MachineList machines={dryers} className={machines.className} />
        </div>
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
    className?: string;
  };
}
