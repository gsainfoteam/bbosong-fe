import { useTranslation } from 'react-i18next';

import { Button, Header } from '@/common/components';
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
      <div className="flex flex-col gap-6 px-3 pb-24">
        <UsingMachineList
          machineList={usingMachineList.machineList}
          onAdd={usingMachineList.onAdd}
          className={usingMachineList.className}
        />
        <SelectBuilding
          dropDownProps={selectBuilding.dropDownProps}
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
      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-120 px-6 pb-6">
        <Button asChild className="bg-bg-surface border-0 py-3.5 text-base font-medium">
          <a
            href="https://infoteam-rulrudino.notion.site/3a4365ea27df802bb3f8c2b8c224a0e1?pvs=105"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('main:surveyNotification')}
          </a>
        </Button>
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
