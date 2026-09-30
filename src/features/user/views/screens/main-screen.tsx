import { useTranslation } from 'react-i18next';

import { Header } from '@/common/components';
import { cn } from '@/common/utils';
import { MachineList, SelectBuilding, UsingMachineList } from '@/features/user';

export function MainScreen({
  usingMachineList,
  selectBuilding,
  machines,
  className,
  ...props
}: MainScreen.Props) {
  const { t } = useTranslation(['machine', 'main']);

  return (
    <div className={cn(className, 'bg-bg h-dvh w-full')} {...props}>
      <Header className="mb-6" />
      <div className="flex flex-col gap-6 px-3">
        <UsingMachineList
          machineList={usingMachineList.machineList}
          className={usingMachineList.className}
        />
        <SelectBuilding
          dropDownProps={selectBuilding.dropDownProps}
          onOpenMap={selectBuilding.onOpenMap}
          className={selectBuilding.className}
        />
        <span className="text-caption">{t('main:mvpNotification')}</span>
        <div>
          <p className="mb-2">{t('washer')}</p>
          <MachineList
            machines={machines.machines.filter((machine) => machine.type === 'washer')}
            className={machines.className}
          />
        </div>
        <div>
          <p className="mb-2">{t('dryer')}</p>
          <MachineList
            machines={machines.machines.filter((machine) => machine.type === 'dryer')}
            className={machines.className}
          />
        </div>
      </div>
    </div>
  );
}

export namespace MainScreen {
  export type Props = {
    usingMachineList: UsingMachineList.Props;
    selectBuilding: SelectBuilding.Props;
    machines: MachineList.Props;
    className?: string;
  };
}
