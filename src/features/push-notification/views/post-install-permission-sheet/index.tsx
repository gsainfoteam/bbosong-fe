import { useState } from 'react';

import { usePermissionPrompt, usePostInstallPermission } from '../../viewmodels';
import { PushPermissionSheet } from '../push-permission-sheet';

const OPEN_DIALOG = '[role="dialog"][data-open], [role="alertdialog"][data-open]';

export function PostInstallPermissionSheet() {
  const { isOpen, dismiss } = usePostInstallPermission();
  const prompt = usePermissionPrompt();
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // 기기 등록에서 같은 안내가 이미 떠 있으면 겹쳐 띄우지 않는다. 열릴 차례가 된 순간에만 한 번 본다.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setOpen(isOpen && !document.querySelector(OPEN_DIALOG));
  }

  return <PushPermissionSheet open={open} onClose={dismiss} prompt={prompt} afterInstall />;
}
