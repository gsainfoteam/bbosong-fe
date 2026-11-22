import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { Sheet } from '@/common/components';

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
    <Sheet ref={dialogRef} aria-label={t('permission.completionTitle')} onCancel={dismiss}>
      <PushPermissionCard presentation="sheet" afterInstall onLater={dismiss} />
    </Sheet>
  );
}
