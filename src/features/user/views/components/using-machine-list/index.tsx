import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { AddUsingMachineBox, UsingMachineBox } from '../';

export function UsingMachineList({
  machineList,
  isNotificationEnabled,
  notificationBlocker,
  onAdd,
  className,
  ...props
}: UsingMachineList.Props) {
  const { t } = useTranslation('main');

  return (
    <div className={cn('', className)} {...props}>
      <p className="mb-3">{t('usingMachineTitle')}</p>
      {/*{machineList.length !== 0 ? (*/}
      <div className="border-border flex w-full gap-2 overflow-x-auto rounded-lg border p-1.5">
        {machineList.map((item) => (
          <UsingMachineBox
            key={`${item.location}-${item.machine.type}-${item.machine.id}`}
            machine={item.machine}
            location={item.location}
            notification={item.notification}
            isNotificationEnabled={isNotificationEnabled}
            notificationBlocker={notificationBlocker}
            onUnregister={item.onUnregister}
            isUnregistering={item.isUnregistering}
          />
        ))}
        <AddUsingMachineBox onAdd={onAdd} />
      </div>
      {/*) : (*/}
      {/*  <div className="bg-bg-surface flex w-full justify-center rounded-lg py-10">*/}
      {/*    {t('noUsingMachine')}*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
}

export namespace UsingMachineList {
  export type Props = {
    machineList: UsingMachineBox.Props[];
    /** 브라우저 알림 권한 허용 여부. false면 모든 박스에 BellOff를 보여준다. */
    isNotificationEnabled: boolean;
    notificationBlocker?: UsingMachineBox.NotificationBlocker;
    onAdd: () => void;
    className?: string;
  };
}
