import { useTranslation } from 'react-i18next';

import { ToggleBoolean } from '@/common/components';
import { cn } from '@/common/utils';

import {
  AlertGender,
  AlertLocation,
  AlertMachineType,
  useLaundryRoomAlert,
  type LaundryRoomAlertTarget,
} from '../viewmodels';

/**
 * 빈 기기 알림 신청 토글.
 *
 * 구독 조회 API가 없어 신청 상태가 새로고침을 넘겨 유지되지 않으므로,
 * 문구를 "알림 신청"이라는 일회성 액션으로 표현해 상태 유지 기대를 낮춘다.
 */
export function LaundryRoomAlertToggle({
  target,
  className,
  ...props
}: LaundryRoomAlertToggle.Props) {
  const { t } = useTranslation('notification');
  const { canSubscribe, permissionStatus, isActive, isPending, toggle } = useLaundryRoomAlert();

  const active = isActive(target);
  const pending = isPending(target);

  const label = t('laundryRoom.label', {
    location:
      target.location === AlertLocation.A ? t('laundryRoom.locationA') : t('laundryRoom.locationB'),
    gender: target.gender === AlertGender.MALE ? t('laundryRoom.male') : t('laundryRoom.female'),
    type:
      target.type === AlertMachineType.WASHER ? t('laundryRoom.washer') : t('laundryRoom.dryer'),
  });

  return (
    <div className={cn('flex items-center justify-between gap-3', className)} {...props}>
      <div className="flex flex-col">
        <span className="text-text-primary">{label}</span>
        {/* 알림을 못 받는 상태에서 신청만 걸리면 사용자는 영문도 모르고 기다리게 된다 */}
        {!canSubscribe && (
          <span className="text-xs opacity-70">
            {permissionStatus === 'denied'
              ? t('laundryRoom.blockedByDenied')
              : t('laundryRoom.needsPermission')}
          </span>
        )}
      </div>

      <ToggleBoolean
        available={canSubscribe && !pending}
        state={active}
        onChange={() => void toggle(target)}
        aria-label={active ? t('laundryRoom.cancel') : t('laundryRoom.request')}
      />
    </div>
  );
}

export namespace LaundryRoomAlertToggle {
  export type Props = {
    target: LaundryRoomAlertTarget;
    className?: string;
  } & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;
}
