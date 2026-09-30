import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { AddUsingMachineBox, UsingMachineBox } from '../';

export function UsingMachineList({ machineList, className, ...props }: UsingMachineList.Props) {
  const { t } = useTranslation('main');

  return (
    <div className={cn('', className)} {...props}>
      <p className="mb-3">{t('usingMachineTitle')}</p>
      {machineList.length !== 0 ? (
        <div className="border-border grid w-fit auto-cols-fr grid-flow-col gap-2 rounded-lg border p-1.5">
          {machineList.map((item) => (
            <UsingMachineBox
              key={`${item.location}-${item.machine.type}-${item.machine.id}`}
              machine={item.machine}
              location={item.location}
              notification={item.notification}
              onClear={item.onClear}
            />
          ))}
          <AddUsingMachineBox />
        </div>
      ) : (
        <div className="bg-bg-surface flex w-full justify-center rounded-lg py-10">
          {t('noUsingMachine')}
        </div>
      )}
    </div>
  );
}

export namespace UsingMachineList {
  export type Props = {
    machineList: UsingMachineBox.Props[];
    className?: string;
  };
}
