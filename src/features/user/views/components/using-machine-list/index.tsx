import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { UsingMachineBox } from '../';

export function UsingMachineList({ userName, machineList, className, ...props }: UsingMachineList.Props) {
  const { t } = useTranslation();

  return (
    <div className={cn('', className)} {...props}>
      <p className="mb-3">{t('user.mypage.usingMachineTitle', { name: userName })}</p>
      {machineList.map((item) => (
        <UsingMachineBox
          key={`${item.location}-${item.machine.type}-${item.machine.id}`}
          machine={item.machine}
          location={item.location}
          onClear={item.onClear}
          className="mb-3"
        />
      ))}
    </div>
  );
}

export namespace UsingMachineList {
  export type Props = {
    userName: string;
    machineList: UsingMachineBox.Props[];
    className?: string;
  };
}
