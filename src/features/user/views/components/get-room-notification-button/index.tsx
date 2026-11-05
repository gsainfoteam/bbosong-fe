import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Modal } from '@/common/components';

/**
 * 빈 기기 알림 신청/취소 버튼.
 *
 * 누르면 확인 모달을 띄우고, 확인 시 `onToggle`을 호출한다.
 * 알림을 받을 수 없는 상태(`blocker`)라면 신청 대신 사유만 안내한다.
 */
export function GetRoomNotificationButton({
  machineType,
  active,
  isPending = false,
  blocker,
  onToggle,
  className,
}: GetRoomNotificationButton.Props) {
  const { t } = useTranslation('notification');
  const [modalOpen, setModalOpen] = useState(false);

  const type = machineType === 'washer' ? t('laundryRoom.washer') : t('laundryRoom.dryer');

  const onModalOpen = () => setModalOpen(true);
  const onModalClose = () => setModalOpen(false);

  const onConfirm = async () => {
    try {
      await onToggle();
    } finally {
      setModalOpen(false);
    }
  };

  const renderModal = () => {
    if (blocker) {
      return (
        <Modal
          title={t('laundryRoom.requestTitle', { type })}
          description={
            blocker === 'denied'
              ? t('laundryRoom.blockedByDenied')
              : t('laundryRoom.needsPermission')
          }
          onConfirm={onModalClose}
          onClose={onModalClose}
        />
      );
    }

    return (
      <Modal
        title={
          active ? t('laundryRoom.cancelTitle', { type }) : t('laundryRoom.requestTitle', { type })
        }
        description={
          active
            ? t('laundryRoom.cancelDescription', { type })
            : t('laundryRoom.requestDescription', { type })
        }
        confirmText={active ? t('laundryRoom.cancelShort') : t('laundryRoom.requestShort')}
        isPending={isPending}
        onConfirm={() => void onConfirm()}
        onClose={onModalClose}
      />
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="minimum"
        size="minimum"
        disabled={isPending}
        aria-pressed={active}
        onClick={onModalOpen}
        className={className}
      >
        {active ? t('laundryRoom.cancelShort') : t('laundryRoom.requestShort')}
      </Button>
      {modalOpen && renderModal()}
    </>
  );
}

export namespace GetRoomNotificationButton {
  export type MachineType = 'washer' | 'dryer';

  /** 알림을 받을 수 없는 사유. 권한이 있으면 undefined */
  export type Blocker = 'needs-permission' | 'denied';

  export type Props = {
    machineType: MachineType;
    /** 이미 알림을 신청해 둔 상태인지 */
    active: boolean;
    /** 구독 상태 조회 중이거나 신청/취소 요청 중 */
    isPending?: boolean;
    blocker?: Blocker;
    /** 실패 처리(토스트 등)는 호출 측 책임이므로 reject하지 않아야 한다. 끝나면 모달은 닫힌다 */
    onToggle: () => Promise<void> | void;
    className?: string;
  };
}
