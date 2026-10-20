import { type ReactNode, useEffect, useRef } from 'react';

import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AdminDialog({ title, onClose, children, isPending, wide }: AdminDialog.Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation('admin');
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="admin-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isPending) onClose();
      }}
      className={`border-border text-text-primary fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${wide ? 'max-w-4xl' : 'max-w-lg'} overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl backdrop:bg-slate-950/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100`}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="admin-dialog-title" className="font-semibold">
          {title}
        </h2>
        <button
          type="button"
          aria-label={t('close')}
          onClick={onClose}
          disabled={isPending}
          className="hover:bg-bg rounded-md p-1 disabled:opacity-50 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
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
