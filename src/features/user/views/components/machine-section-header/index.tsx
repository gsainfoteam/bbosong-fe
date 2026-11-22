import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { GetRoomNotificationButton } from '../get-room-notification-button';

/**
 * 세탁기/건조기 목록의 섹션 머리.
 * 빈 자리 수를 기기 색으로 보여 주고, 빈 자리가 없을 때만 "빈 자리 알림" 버튼을 붙인다.
 */
export function MachineSectionHeader({
  title,
  machineType,
  freeCount,
  roomNotification,
  className,
}: MachineSectionHeader.Props) {
  const { t } = useTranslation('machine');
  const hasFree = freeCount > 0;

  return (
    <div className={cn('flex h-7 items-center justify-between', className)}>
      <h2 className="text-section">{title}</h2>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'text-label',
            hasFree && (machineType === 'washer' ? 'text-sky-ink' : 'text-orange-ink'),
            !hasFree && 'text-ink3 font-medium',
          )}
        >
          {hasFree ? t('freeCount', { count: freeCount }) : t('noFree')}
        </span>
        {!hasFree && <GetRoomNotificationButton {...roomNotification} />}
      </div>
    </div>
  );
}

export namespace MachineSectionHeader {
  export type Props = {
    title: string;
    machineType: 'washer' | 'dryer';
    /** 지금 쓸 수 있는 기기 수. 0이면 "빈 자리 알림" 버튼이 나온다. */
    freeCount: number;
    roomNotification: GetRoomNotificationButton.Props;
    className?: string;
  };
}
