import { type ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react';

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
  hideCancel = false,
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

  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelHadFocusRef = useRef(false);

  // ref 정리는 DOM에서 제거되기 전에 실행되므로, 이때 취소 버튼이 포커스를 갖고 있었는지 기록해 둔다.
  const cancelRef = useCallback((node: HTMLButtonElement | null) => {
    if (!node) return;
    cancelHadFocusRef.current = false;
    return () => {
      cancelHadFocusRef.current = document.activeElement === node;
    };
  }, []);

  // 열린 상태에서 취소 버튼이 숨겨지면 포커스가 사라지므로 확인 버튼으로 옮긴다.
  // 그 사이 포커스가 다른 곳으로 옮겨졌다면(예: isPending으로 숨겨진 뒤 이동) 건드리지 않는다.
  useLayoutEffect(() => {
    const focusLost = !document.activeElement || document.activeElement === document.body;
    if (hideCancel && cancelHadFocusRef.current && focusLost) confirmRef.current?.focus();
    cancelHadFocusRef.current = false;
  }, [hideCancel]);

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
        {/* 처리 중에는 닫을 수 없으므로 취소 버튼을 숨기고 진행 상태만 보여준다. */}
        {!isPending && !hideCancel && (
          <Button ref={cancelRef} type="button" autoFocus onClick={onClose}>
            {cancelText ?? t('modal.cancel')}
          </Button>
        )}
        <Button
          ref={confirmRef}
          type="button"
          autoFocus={hideCancel}
          disabled={isPending}
          onClick={onConfirm}
        >
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
    /** true면 취소 버튼을 숨기고 확인 버튼을 비활성화하며 Escape로 닫히지 않는다. */
    isPending?: boolean;
    /** true면 취소 버튼 없이 확인 버튼만 보여준다. 안내만 하는 모달에 쓴다. */
    hideCancel?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    className?: string;
  };
}
