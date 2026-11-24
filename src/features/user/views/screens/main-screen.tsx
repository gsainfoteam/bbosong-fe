import { ChevronDown, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, coachMarkTarget, Header } from '@/common/components';
import { cn } from '@/common/utils';
import { GetRoomNotificationButton, MachineList, MyLaundryCard } from '@/features/user';
import { type MachineType, type MachineView } from '@/features/user/viewmodels';

const FREE_TEXT = { washer: 'text-sky-ink', dryer: 'text-orange-ink' } as const;

function MachineSection({
  type,
  machines,
  notification,
  onMachineLongPress,
}: {
  type: MachineType;
  machines: MachineView[];
  notification: GetRoomNotificationButton.Props;
  onMachineLongPress?: MachineList.Props['onMachineLongPress'];
}) {
  const { t } = useTranslation('machine');
  const free = machines.filter((machine) => machine.state === 'idle').length;

  return (
    <section className="mt-4.5 [&+&]:mt-6.5">
      <div className="mb-5 flex h-5.5 items-center justify-between">
        <h2 className="text-[16px] font-extrabold tracking-[-0.02em]">
          {type === 'washer' ? t('washer') : t('dryer')}
        </h2>
        {machines.length > 0 && (
          <span className="flex items-center gap-2.5">
            {free > 0 ? (
              <span className={cn('text-[13px] font-bold', FREE_TEXT[type])}>
                {t('free', { n: String(free) })}
              </span>
            ) : (
              <>
                <span className="text-ink-3 text-[13px] font-medium">{t('noFree')}</span>
                <span {...coachMarkTarget('alert')} className="inline-flex rounded-full">
                  <GetRoomNotificationButton {...notification} />
                </span>
              </>
            )}
          </span>
        )}
      </div>
      {machines.length > 0 ? (
        <MachineList machines={machines} onMachineLongPress={onMachineLongPress} />
      ) : (
        <p className="bg-soft rounded-banner text-ink-3 py-7.5 text-center text-[13.5px] font-medium">
          {type === 'washer' ? t('emptyWasher') : t('emptyDryer')}
        </p>
      )}
    </section>
  );
}

export function MainScreen({
  header,
  myLaundry,
  room,
  washers,
  dryers,
  roomNotification,
  onMachineLongPress,
  onRegister,
  className,
}: MainScreen.Props) {
  const { t } = useTranslation(['main', 'common']);
  const solo = myLaundry.items.length === 1;

  return (
    <div className={cn('bg-soft flex min-h-dvh w-full flex-col', className)}>
      <Header {...header} />
      {myLaundry.items.length > 0 && (
        <div className={cn('-mt-0.5 grid gap-2.5 px-5', solo ? 'grid-cols-1' : 'grid-cols-2')}>
          {myLaundry.items.map(({ machine, onUnregister, isUnregistering }) => (
            <MyLaundryCard
              key={machine.uuid}
              machine={machine}
              solo={solo}
              isNotificationEnabled={myLaundry.isNotificationEnabled}
              notificationBlocker={myLaundry.notificationBlocker}
              onUnregister={onUnregister}
              isUnregistering={isUnregistering}
            />
          ))}
        </div>
      )}
      <div
        className={cn(
          'bg-surface rounded-t-sheet flex-1 px-5 pt-5 pb-[calc(max(24px,env(safe-area-inset-bottom,0px)+6px)+80px)]',
          myLaundry.items.length > 0 ? 'mt-4' : '-mt-0.5',
        )}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={t('roomCurrent', { room: room.title })}
          onClick={room.onOpen}
          className="flex h-6.5 items-center gap-0.5 text-[21px] font-extrabold tracking-[-0.03em]"
        >
          {room.title}
          <ChevronDown size={20} className="text-ink-3 mt-0.75" aria-hidden />
        </button>
        {/* 온보딩이 세탁기·건조기 두 구역을 함께 짚는다 */}
        <div className="rounded-banner" {...coachMarkTarget('machines')}>
          <MachineSection
            type="washer"
            machines={washers}
            notification={roomNotification.washer}
            onMachineLongPress={onMachineLongPress}
          />
          <MachineSection
            type="dryer"
            machines={dryers}
            notification={roomNotification.dryer}
            onMachineLongPress={onMachineLongPress}
          />
        </div>
      </div>
      <div className="pb-cta from-surface pointer-events-none fixed inset-x-0 bottom-0 mx-auto w-full max-w-120 bg-linear-to-t from-55% to-transparent px-5 pt-10">
        <Button
          type="button"
          size="l"
          wide
          float
          onClick={onRegister}
          className="pointer-events-auto"
          {...coachMarkTarget('register')}
        >
          <QrCode size={20} aria-hidden />
          {t('common:registerLabel')}
        </Button>
      </div>
    </div>
  );
}

export namespace MainScreen {
  export type MyLaundryItem = {
    machine: MachineView;
    onUnregister: () => void;
    isUnregistering?: boolean;
  };

  export type Props = {
    header?: Header.Props;
    myLaundry: {
      items: MyLaundryItem[];
      isNotificationEnabled: boolean;
      notificationBlocker?: MyLaundryCard.NotificationBlocker;
    };
    room: {
      title: string;
      onOpen: () => void;
    };
    washers: MachineView[];
    dryers: MachineView[];
    roomNotification: Record<MachineType, GetRoomNotificationButton.Props>;
    onMachineLongPress?: MachineList.Props['onMachineLongPress'];
    onRegister: () => void;
    className?: string;
  };
}
