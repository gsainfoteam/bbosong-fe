import { type ReactNode } from 'react';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function AdminDialog({ title, onClose, children, isPending, wide }: AdminDialog.Props) {
  const { t } = useTranslation('admin');

  return (
    // 폼을 담는 대화상자라 바깥을 눌러도 닫지 않는다. 입력하던 값이 한 번의 오클릭으로 사라지지 않게 한다.
    <Dialog.Root
      open
      disablePointerDismissal
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/40" />
        <Dialog.Popup
          className={cn(
            'border-border text-text-primary fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] -translate-1/2 overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
            wide ? 'max-w-4xl' : 'max-w-lg',
          )}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <Dialog.Title className="font-semibold">{title}</Dialog.Title>
            <Dialog.Close
              aria-label={t('close')}
              disabled={isPending}
              className="hover:bg-bg rounded-md p-1 disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export namespace AdminDialog {
  export type Props = {
    title: string;
    onClose: () => void;
    children: ReactNode;
    isPending?: boolean;
    wide?: boolean;
  };
}
