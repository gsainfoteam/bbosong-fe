import { useState } from 'react';

import { Bell, BellOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@/common/components';
import { cn } from '@/common/utils';

import { MachineBox } from '../machine-box';
import { toDisplay, useLabels } from '../machine-box/labels';

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

/** 숫자는 크게, 단위는 본문 크기로 보여 준다. (예: 1시간 3분 → 1 · 시간 · 3 · 분) */
function Numeral({ text }: { text: string }) {
  return text.split(/(\d+)/).map((part, index) =>
    /^\d+$/.test(part) ? (
      <span key={index} className="text-numeral mr-px">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function UsingMachineBox({
  machine,
  location: _location,
  notification,
  isNotificationEnabled = true,
  notificationBlocker,
  state = { status: 'using' },
  onUnregister,
  isUnregistering = false,
  className,
  ...props
}: UsingMachineBox.Props) {
  const { t } = useTranslation(['mypage', 'machine', 'location', 'machineRegister']);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // t('machine:washer')
  // t('machine:dryer')
  // t('machine:count')
  // t('location:a')
  // t('location:b')
  // t('location:laundryRoom')
  // t('machineRegister:unregister.confirmation.notificationDisabled')
  // t('machineRegister:unregister.confirmation.notificationNeedsInstall')
  // t('machineRegister:unregister.confirmation.notificationUnsupported')

  const display = toDisplay({ ...machine, ...state, mine: true });
  const { caption, spoken } = useLabels(display);
  const name = `${t(MACHINE_KEYS[machine.type])} ${t('machine:count', { id: String(machine.id) })}`;

  return (
    <div className={cn('relative min-w-0', className)} {...props}>
      <button
        type="button"
        aria-label={[
          name,
          t('machine:mine'),
          spoken,
          t('machineRegister:unregister.confirmation.title'),
        ].join(', ')}
        onClick={() => setIsConfirmOpen(true)}
        className="bg-surface rounded-banner flex w-full min-w-0 cursor-pointer items-center gap-3 px-3.5 py-3 text-left transition duration-120 active:scale-[0.97]"
      >
        <MachineBox
          machine={{ ...machine, ...state, mine: true }}
          showCaption={false}
          className="w-10 shrink-0"
        />
        <span className="min-w-0">
          <span className="text-body block leading-none font-bold whitespace-nowrap">
            <Numeral text={caption} />
          </span>
          <span className="text-caption text-ink2 mt-1.5 block leading-none whitespace-nowrap">
            {name}
          </span>
        </span>
      </button>
      {/* 알림 상태는 모서리에 작게 표시만 한다. 해제는 카드를 눌러 확인 모달에서 한다. */}
      <span aria-hidden className="absolute top-2.5 right-3 flex">
        {isNotificationEnabled ? (
          <Bell size={14} className={notification ? 'text-ink' : 'text-ink3'} />
        ) : (
          <BellOff size={14} className="text-ink3" />
        )}
      </span>
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
            <p role="note" className="text-danger">
              {t(NOTIFICATION_DISABLED_KEYS[notificationBlocker ?? 'default'])}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

export namespace UsingMachineBox {
  /** 브라우저 설정으로는 알림을 켤 수 없는 이유 */
  export type NotificationBlocker = 'needs-install' | 'unsupported';

  export type Props = {
    machine: { type: 'washer' | 'dryer'; id: number };
    location: 'a' | 'b';
    notification: boolean;
    /** 시간·상태. 알 수 없으면 "사용 중"으로 보여 준다. */
    state?: Omit<MachineBox.Props['machine'], 'type' | 'id' | 'mine'>;
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
