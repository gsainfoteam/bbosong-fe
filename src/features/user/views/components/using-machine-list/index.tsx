import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { UsingMachineBox } from '../';

/** 내 빨래 카드. 한 대면 한 줄, 두 대 이상이면 두 줄 열로 놓고, 없으면 자리를 접는다. */
export function UsingMachineList({
  machineList,
  isNotificationEnabled,
  notificationBlocker,
  className,
  ...props
}: UsingMachineList.Props) {
  const { t } = useTranslation('main');

  if (machineList.length === 0) return null;

  return (
    <section
      aria-label={t('usingMachineTitle')}
      className={cn(
        'grid gap-2.5',
        machineList.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
        className,
      )}
      {...props}
    >
      {machineList.map((item) => (
        <UsingMachineBox
          key={`${item.location}-${item.machine.type}-${item.machine.id}`}
          machine={item.machine}
          location={item.location}
          notification={item.notification}
          state={item.state}
          isNotificationEnabled={isNotificationEnabled}
          notificationBlocker={notificationBlocker}
          onUnregister={item.onUnregister}
          isUnregistering={item.isUnregistering}
        />
      ))}
    </section>
  );
}

export namespace UsingMachineList {
  export type Props = {
    machineList: UsingMachineBox.Props[];
    /** 브라우저 알림 권한 허용 여부. false면 모든 카드에 BellOff를 보여준다. */
    isNotificationEnabled: boolean;
    notificationBlocker?: UsingMachineBox.NotificationBlocker;
    className?: string;
  };
}
