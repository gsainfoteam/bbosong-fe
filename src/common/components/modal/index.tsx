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
  confirmVariant = 'primary',
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
        'bg-surface text-ink shadow-dialog rounded-sheet backdrop:bg-ink/44 fixed inset-0 m-auto w-[calc(100%-4rem)] max-w-81.5 border-0 px-5 pt-6 pb-5',
        className,
      )}
    >
      <h2 id={titleId} className="text-heading text-balance">
        {title}
      </h2>
      {description && (
        <p id={descriptionId} className="text-body text-ink2 mt-2">
          {description}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
      <div
        className={cn(
          'mt-5.5 grid gap-2',
          !isPending && !hideCancel ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        {/* 처리 중에는 닫을 수 없으므로 취소 버튼을 숨기고 진행 상태만 보여준다. */}
        {!isPending && !hideCancel && (
          <Button ref={cancelRef} type="button" variant="secondary" autoFocus onClick={onClose}>
            {cancelText ?? t('modal.cancel')}
          </Button>
        )}
        <Button
          ref={confirmRef}
          type="button"
          variant={confirmVariant}
          autoFocus={hideCancel}
          loading={isPending}
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
    /** 확인 버튼 종류. 탈퇴처럼 되돌릴 수 없는 동작에만 danger를 쓴다. */
    confirmVariant?: 'primary' | 'danger';
    onConfirm: () => void;
    onClose: () => void;
    className?: string;
  };
}
