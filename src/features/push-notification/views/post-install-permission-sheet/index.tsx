import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { BottomSheet, Button } from '@/common/components';

import { usePostInstallPermission } from '../../viewmodels';
import { PushPermissionCard } from '../push-permission-card';

const OPEN_DIALOG = '[role="dialog"][data-open], [role="alertdialog"][data-open]';

export function PostInstallPermissionSheet() {
  const { t } = useTranslation('notification');
  const { isOpen, dismiss } = usePostInstallPermission();
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // 기기 등록 등에서 이미 다른 대화상자가 열려 있다면 시트를 겹쳐 띄우지 않는다.
  // 열릴 차례가 된 순간에만 한 번 본다. 그 뒤 다른 대화상자가 닫혀도 시트를 다시 띄우지 않는다.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setOpen(isOpen && !document.querySelector(OPEN_DIALOG));
  }

  return (
    <BottomSheet open={open} onClose={dismiss} aria-label={t('permission.completionTitle')}>
      <PushPermissionCard presentation="sheet" afterInstall />
      <Button
        type="button"
        onClick={dismiss}
        className="text-ink-2 mt-3 w-full border-0 py-3 text-sm"
      >
        {t('permission.later')}
      </Button>
    </BottomSheet>
  );
}
