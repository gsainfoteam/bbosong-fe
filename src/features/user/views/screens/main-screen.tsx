import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Header } from '@/common/components';
import { cn } from '@/common/utils';
import { GetRoomNotificationButton, MachineList, MyLaundryCard } from '@/features/user';
import { type MachineType, type MachineView } from '@/features/user/viewmodels';

const FREE_TEXT = { washer: 'text-sky-ink', dryer: 'text-orange-ink' } as const;

function MachineSection({
  type,
  machines,
  notification,
}: {
  type: MachineType;
  machines: MachineView[];
  notification: GetRoomNotificationButton.Props;
}) {
  const { t } = useTranslation('machine');
  const free = machines.filter((machine) => machine.state === 'idle').length;

  return (
    <section className="mt-6 [&+&]:mt-8">
      <div className="mb-[22px] flex h-[22px] items-center justify-between">
        <h2 className="text-[16px] font-extrabold tracking-[-0.02em]">
          {type === 'washer' ? t('washer') : t('dryer')}
        </h2>
        <span className="flex items-center gap-2.5">
          {free > 0 ? (
            <span className={cn('text-[13px] font-bold', FREE_TEXT[type])}>
              {t('free', { n: String(free) })}
            </span>
          ) : (
            <>
              <span className="text-ink-3 text-[13px] font-medium">{t('noFree')}</span>
              <GetRoomNotificationButton {...notification} />
            </>
          )}
        </span>
      </div>
      <MachineList machines={machines} />
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
  className,
}: MainScreen.Props) {
  const { t } = useTranslation('main');
  const solo = myLaundry.items.length === 1;

  return (
    <div className={cn('bg-soft flex min-h-dvh w-full flex-col', className)}>
      {/* 헤더 위는 11px만 둔다. 폰에서는 바로 위에 상태 표시줄이 붙어 그 여백까지 더해 보인다. */}
      <Header {...header} />
      {/*
        간격은 헤더의 보이는 끝(등록 버튼 아래, 헤더 끝보다 11px 위)에서 잰다.
        그래야 헤더→카드와 카드→시트 간격이 눈으로 같아진다. 카드가 없으면 시트가 그 자리를 잇는다.
      */}
      {myLaundry.items.length > 0 && (
        <div className={cn('mt-[11px] grid gap-2.5 px-5', solo ? 'grid-cols-1' : 'grid-cols-2')}>
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
          'bg-surface rounded-t-sheet flex-1 px-5 pt-6 pb-[max(24px,env(safe-area-inset-bottom))]',
          myLaundry.items.length > 0 ? 'mt-[22px]' : 'mt-[11px]',
        )}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={t('roomCurrent', { room: room.title })}
          onClick={room.onOpen}
          className="flex h-[26px] items-center gap-0.5 text-[21px] font-extrabold tracking-[-0.03em]"
        >
          {room.title}
          <ChevronDown size={20} className="text-ink-3 mt-[3px]" aria-hidden />
        </button>
        <MachineSection type="washer" machines={washers} notification={roomNotification.washer} />
        <MachineSection type="dryer" machines={dryers} notification={roomNotification.dryer} />
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
    className?: string;
  };
}
