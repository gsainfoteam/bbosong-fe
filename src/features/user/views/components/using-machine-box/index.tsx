import { useState } from 'react';

import { Bell, BellOff, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@/common/components';
import { cn } from '@/common/utils';

const MACHINE_KEYS = {
  washer: 'machine:washer',
  dryer: 'machine:dryer',
} as const;

// 알림이 꺼진 이유별 해제 모달 안내 문구. default는 브라우저 설정에서 허용하라는 안내다.
const NOTIFICATION_DISABLED_KEYS = {
  default: 'machineRegister:unregister.confirmation.notificationDisabled',
  'needs-install': 'machineRegister:unregister.confirmation.notificationNeedsInstall',
  unsupported: 'machineRegister:unregister.confirmation.notificationUnsupported',
} as const;

// const LOCATION_KEYS = {
//   a: 'location:a',
//   b: 'location:b',
// } as const;

export function UsingMachineBox({
  machine,
  location,
  notification,
  isNotificationEnabled = true,
  notificationBlocker,
  onUnregister,
  isUnregistering = false,
  className,
  ...props
}: UsingMachineBox.Props) {
  const { t } = useTranslation(['mypage', 'machine', 'location', 'machineRegister']);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // t('machine:washer')
  // t('machine:dryer')
  // t('location:a')
  // t('location:b')
  // t('location:laundryRoom')
  // t('machineRegister:unregister.confirmation.notificationDisabled')
  // t('machineRegister:unregister.confirmation.notificationNeedsInstall')
  // t('machineRegister:unregister.confirmation.notificationUnsupported')

  return (
    <div
      className={cn(
        className,
        'text-text-primary border-border flex min-h-20 min-w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-2',
      )}
      {...props}
    >
      <p>
        {t(`location:${location}`)} {t('machine:count', { id: String(machine.id) })}
      </p>
      <p className="mb-0.5">{t(MACHINE_KEYS[machine.type])}</p>
      <button
        type="button"
        aria-label={t('machineRegister:unregister.confirmation.title')}
        onClick={() => setIsConfirmOpen(true)}
      >
        {isNotificationEnabled ? (
          <Bell className={cn(notification && 'text-primary')} aria-hidden />
        ) : (
          <BellOff aria-hidden />
        )}
      </button>
      {isConfirmOpen && (
        <Modal
          title={t('machineRegister:unregister.confirmation.title')}
          description={t('machineRegister:unregister.confirmation.description')}
          confirmText={
            isUnregistering
              ? t('machineRegister:unregister.confirmation.pending')
              : t('machineRegister:unregister.confirmation.confirm')
          }
          isPending={isUnregistering}
          onConfirm={onUnregister}
          onClose={() => setIsConfirmOpen(false)}
        >
          {!isNotificationEnabled && (
            <p role="note" className="text-text-error">
              {t(NOTIFICATION_DISABLED_KEYS[notificationBlocker ?? 'default'])}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

export function AddUsingMachineBox({ onAdd }: AddUsingMachineBox.Props) {
  const { t } = useTranslation('mypage');

  return (
    <button
      type="button"
      aria-label={t('addMachine')}
      className="flex min-h-20 w-20 shrink-0 items-center justify-center"
      onClick={onAdd}
    >
      <Plus size={32} strokeWidth={1.5} aria-hidden />
    </button>
  );
}

export namespace UsingMachineBox {
  /** 브라우저 설정으로는 알림을 켤 수 없는 이유 */
  export type NotificationBlocker = 'needs-install' | 'unsupported';

  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
    notification: boolean;
    /** 브라우저 알림 권한이 꺼져 있으면 false. BellOff 아이콘과 해제 모달에 안내 문구를 보여준다. */
    isNotificationEnabled?: boolean;
    /**
     * 브라우저 설정으로는 알림을 켤 수 없는 이유. 해제 모달의 안내 문구를 고른다.
     * - needs-install: 앱 설치가 먼저 필요하다.
     * - unsupported: 이 브라우저는 웹 푸시를 지원하지 않는다.
     */
    notificationBlocker?: NotificationBlocker;
    /** 확인 모달에서 확인을 누르면 호출된다. 성공 시 목록에서 빠지며 모달도 함께 사라진다. */
    onUnregister: () => void;
    isUnregistering?: boolean;
    className?: string;
  };
}

export namespace AddUsingMachineBox {
  export type Props = {
    onAdd: () => void;
  };
}
