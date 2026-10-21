import { useEffect, useId, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@/common/components';

export function MachineCompletionDialog({
  isPending,
  onConfirm,
  onClose,
}: MachineCompletionDialog.Props) {
  const { t } = useTranslation('machineRegister');
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={isPending}
      onCancel={(event) => {
        event.preventDefault();
        if (!isPending) onClose();
      }}
      className="bg-bg border-border text-text-primary fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-120 rounded-2xl border p-6 shadow-xl backdrop:bg-black/40"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {t('confirmation.title')}
      </h2>
      <p id={descriptionId} className="text-text-secondary mt-3 text-sm">
        {t('confirmation.description')}
      </p>
      <div className="mt-6 flex gap-3">
        <Button type="button" autoFocus disabled={isPending} onClick={onClose}>
          {t('confirmation.no')}
        </Button>
        <Button type="button" disabled={isPending} onClick={onConfirm}>
          {isPending ? t('registering') : t('confirmation.yes')}
        </Button>
      </div>
    </dialog>
  );
}

export namespace MachineCompletionDialog {
  export type Props = {
    isPending: boolean;
    onConfirm: () => void;
    onClose: () => void;
  };
}
