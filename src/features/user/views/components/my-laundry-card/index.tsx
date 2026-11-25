import { useState } from 'react';

import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { coachMarkTarget, Modal } from '@/common/components';
import { cn } from '@/common/utils';
import { type MachineView } from '@/features/user/viewmodels';

import { useMachineText } from '../machine-cell';
import { MachineVessel } from '../machine-vessel';
import { RemainingTimeSheet } from '../remaining-time-sheet';

// 단위 글자는 본문 크기로 두고 숫자만 키워 숫자 글꼴로 쓴다. 언어마다 단위 위치가 달라 문장을 숫자 기준으로 쪼갠다.
function BigTime({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className="font-num mr-px text-[24px] tracking-[-0.01em]">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function MyLaundryCard({
  machine,
  solo = false,
  isNotificationEnabled = true,
  notificationBlocker,
  onUnregister,
  isUnregistering = false,
  onSetRemainingTime,
  isSettingRemainingTime = false,
  className,
}: MyLaundryCard.Props) {
  const { t } = useTranslation(['machineRegister', 'main']);
  const text = useMachineText();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // 세탁기는 ThinQ가 없어 화면에 보이는 남은 시간을 직접 입력받는다. 내 기기만 이 카드에 오므로 세션 소유자다.
  const canSetRemainingTime =
    onSetRemainingTime !== undefined &&
    machine.type === 'washer' &&
    (machine.state === 'running' || machine.state === 'elapsed');

  // 알림이 꺼진 이유별 해제 모달 안내 문구. default는 브라우저 설정에서 허용하라는 안내다.
  const notificationDisabled = {
    default: t('machineRegister:unregister.confirmation.notificationDisabled'),
    'needs-install': t('machineRegister:unregister.confirmation.notificationNeedsInstall'),
    unsupported: t('machineRegister:unregister.confirmation.notificationUnsupported'),
  } satisfies Record<MyLaundryCard.NotificationBlocker | 'default', string>;

  // 세탁기는 시간 옆에 연필을 붙여 눌러서 입력/수정할 수 있음을 알린다
  const pencil = canSetRemainingTime && (
    <Pencil size={13} strokeWidth={2.5} aria-hidden className="text-ink-3 mb-0.5 ml-1 inline" />
  );

  const value = (() => {
    if (machine.state === 'running' || machine.state === 'paused')
      return <BigTime text={text.duration(machine.remainingMinutes ?? 0)} />;
    if (machine.state === 'elapsed' && machine.elapsedMinutes !== undefined)
      return <BigTime text={text.elapsed(machine.elapsedMinutes)} />;
    return <span className="text-[17px] leading-6">{text.label(machine)}</span>;
  })();

  const detail = [
    machine.state === 'paused' ? text.label(machine) : text.phase(machine),
    // 한 대뿐이면 카드가 폭을 다 써서, 남는 자리에 종료 시각을 붙인다.
    solo && machine.state === 'running' && machine.endsAt && text.endsAt(machine.endsAt),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={cn('bg-surface flex min-w-0 flex-col rounded-[20px]', className)}>
      <button
        type="button"
        aria-label={t(canSetRemainingTime ? 'main:manageLabel' : 'main:unregisterLabel', {
          machine: text.aria(machine),
        })}
        onClick={() => (canSetRemainingTime ? setIsTimeOpen(true) : setIsConfirmOpen(true))}
        {...(canSetRemainingTime ? coachMarkTarget('washer-time') : {})}
        className="flex min-w-0 items-center gap-3 rounded-[20px] px-3.5 py-3 text-left transition-transform active:scale-[0.97]"
      >
        <MachineVessel
          type={machine.type}
          id={machine.id}
          state={machine.state}
          level={machine.level}
          mine
          badge={false}
          size={40}
        />
        <span className="min-w-0">
          <span className="block text-[14px] leading-none font-bold tracking-[-0.01em] whitespace-nowrap">
            {value}
            {pencil}
          </span>
          <span className="text-ink-2 mt-1.5 block truncate text-[12.5px] leading-none">
            {detail}
          </span>
        </span>
      </button>
      {isTimeOpen && (
        <RemainingTimeSheet
          open
          initialMinutes={machine.state === 'running' ? machine.remainingMinutes : undefined}
          isPending={isSettingRemainingTime}
          onSubmit={(minutes) => onSetRemainingTime?.(minutes, () => setIsTimeOpen(false))}
          onUnregister={() => {
            setIsTimeOpen(false);
            setIsConfirmOpen(true);
          }}
          onClose={() => setIsTimeOpen(false)}
        />
      )}
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
              {notificationDisabled[notificationBlocker ?? 'default']}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

export namespace MyLaundryCard {
  /** 브라우저 설정으로는 알림을 켤 수 없는 이유 */
  export type NotificationBlocker = 'needs-install' | 'unsupported';

  export type Props = {
    machine: MachineView;
    /** 내 빨래가 한 대뿐이면 카드가 폭을 다 쓴다 */
    solo?: boolean;
    /** 알림 권한이 꺼져 있으면 해제 모달에 안내 문구를 덧붙인다 */
    isNotificationEnabled?: boolean;
    notificationBlocker?: NotificationBlocker;
    /** 성공하면 목록에서 빠지며 모달도 함께 사라진다 */
    onUnregister: () => void;
    isUnregistering?: boolean;
    /** 세탁기에서만 쓴다. 입력한 분(1~180)을 보내고, 성공하면 `onSuccess`로 시트를 닫는다 */
    onSetRemainingTime?: (minutes: number, onSuccess: () => void) => void;
    isSettingRemainingTime?: boolean;
    className?: string;
  };
}
