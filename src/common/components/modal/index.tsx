import { type ReactNode, useCallback, useLayoutEffect, useRef } from 'react';

import { AlertDialog } from '@base-ui/react/alert-dialog';
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
  destructive = false,
  onConfirm,
  onClose,
  className,
}: Modal.Props) {
  const { t } = useTranslation('common');
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
    // 부모가 열 때 마운트하고 닫을 때 지우므로 늘 열린 채로 그린다. 닫기는 onClose로 부모에게 맡긴다.
    <AlertDialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="bg-ink/44 ease-sheet fixed inset-0 z-50 transition-opacity duration-300 data-starting-style:opacity-0" />
        <AlertDialog.Popup
          aria-busy={isPending}
          className={cn(
            'text-ink rounded-sheet shadow-overlay ease-sheet fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[340px] -translate-1/2 bg-white px-5 pt-6 pb-5 outline-none',
            'transition-[opacity,scale] duration-300 data-starting-style:scale-95 data-starting-style:opacity-0',
            className,
          )}
        >
          <AlertDialog.Title className="text-[19px] leading-[1.35] font-extrabold tracking-[-0.025em] text-balance">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="text-ink-2 mt-2 text-sm leading-[1.6]">
              {description}
            </AlertDialog.Description>
          )}
          {children && <div className="mt-3 text-sm leading-[1.6]">{children}</div>}
          <div className="mt-[22px] flex gap-2 *:flex-1">
            {/* 처리 중에는 닫을 수 없으므로 취소 버튼을 숨기고 진행 상태만 보여준다. */}
            {!isPending && !hideCancel && (
              <Button ref={cancelRef} type="button" variant="secondary" autoFocus onClick={onClose}>
                {cancelText ?? t('modal.cancel')}
              </Button>
            )}
            <Button
              ref={confirmRef}
              type="button"
              variant={destructive ? 'danger' : 'primary'}
              autoFocus={hideCancel}
              disabled={isPending}
              onClick={onConfirm}
            >
              {confirmText ?? t('modal.confirm')}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
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
    destructive?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    className?: string;
  };
}
