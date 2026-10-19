import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@/common/components';

import { usePostInstallPermission } from '../../viewmodels';
import { PushPermissionCard } from '../push-permission-card';

export function PostInstallPermissionSheet() {
  const { t } = useTranslation('notification');
  const { isOpen, dismiss } = usePostInstallPermission();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // 기기 등록 등에서 이미 알림 안내가 열려 있다면 시트를 겹쳐 띄우지 않는다.
      if (!document.querySelector('dialog[open]')) dialog.showModal();
    } else {
      dialog.close();
    }

    return () => dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('permission.completionTitle')}
      className="bg-bg text-text-primary fixed inset-x-0 top-auto bottom-0 mx-auto my-0 max-h-[85dvh] w-full max-w-120 overflow-y-auto rounded-t-3xl px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop:bg-black/40"
      onCancel={dismiss}
    >
      <div aria-hidden="true" className="bg-border mx-auto mb-6 h-1 w-10 rounded-full" />
      <PushPermissionCard presentation="sheet" afterInstall />
      <Button
        type="button"
        onClick={dismiss}
        className="text-text-secondary mt-3 w-full border-0 py-3 text-sm"
      >
        {t('permission.later')}
      </Button>
    </dialog>
  );
}
