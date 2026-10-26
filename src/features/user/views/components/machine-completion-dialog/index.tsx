import { useTranslation } from 'react-i18next';

import { Modal } from '@/common/components';

export function MachineCompletionDialog({
  isPending,
  onConfirm,
  onClose,
}: MachineCompletionDialog.Props) {
  const { t } = useTranslation('machineRegister');

  return (
    <Modal
      title={t('confirmation.title')}
      description={t('confirmation.description')}
      confirmText={isPending ? t('registering') : t('confirmation.yes')}
      cancelText={t('confirmation.no')}
      isPending={isPending}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

export namespace MachineCompletionDialog {
  export type Props = {
    isPending: boolean;
    onConfirm: () => void;
    onClose: () => void;
  };
}
