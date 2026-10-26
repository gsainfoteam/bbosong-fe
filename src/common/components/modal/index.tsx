import { type ReactNode, useEffect, useId, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

import { Button } from '../ui';

export function Modal({
  title,
  description,
  children,
  confirmText,
  cancelText,
  isPending = false,
  onConfirm,
  onClose,
  className,
}: Modal.Props) {
  const { t } = useTranslation('common');
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // 마운트 시 모달로 열고, 언마운트 시 닫는다.
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={isPending}
      onCancel={(event) => {
        event.preventDefault();
        if (!isPending) onClose();
      }}
      className={cn(
        'bg-bg border-border text-text-primary fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-120 rounded-2xl border p-6 shadow-xl backdrop:bg-black/40',
        className,
      )}
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>
      {description && (
        <p id={descriptionId} className="text-text-secondary mt-3 text-sm">
          {description}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
      <div className="mt-6 flex gap-3">
        <Button type="button" autoFocus disabled={isPending} onClick={onClose}>
          {cancelText ?? t('modal.cancel')}
        </Button>
        <Button type="button" disabled={isPending} onClick={onConfirm}>
          {confirmText ?? t('modal.confirm')}
        </Button>
      </div>
    </dialog>
  );
}

export namespace Modal {
  export type Props = {
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    /** 확인 버튼 라벨. 없으면 common:modal.confirm("확인")을 쓴다. */
    confirmText?: ReactNode;
    /** 취소 버튼 라벨. 없으면 common:modal.cancel("취소")을 쓴다. */
    cancelText?: ReactNode;
    /** true면 버튼을 비활성화하고 Escape로 닫히지 않는다. */
    isPending?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    className?: string;
  };
}
