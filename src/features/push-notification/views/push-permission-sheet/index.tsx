import { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { BottomSheet, Button } from '@/common/components';
import { cn } from '@/common/utils';

import { type PermissionPrompt } from '../../viewmodels';

export function PushPermissionSheet({
  open,
  onClose,
  prompt,
  art,
  afterInstall = false,
}: PushPermissionSheet.Props) {
  const { t } = useTranslation('notification');
  const { status, isNative, isRequesting, requestPermission, install } = prompt;

  const messages: ReactNode[] = [];
  let primary: ReactNode = null;

  if (status === 'default') {
    messages.push(
      afterInstall ? t('permission.description') : t('permission.completionDescription'),
    );
    // 브라우저는 사용자가 직접 누른 동작 안에서만 권한 창을 띄워 준다.
    primary = (
      <Button type="button" onClick={() => void requestPermission()} loading={isRequesting}>
        {isRequesting ? t('permission.requesting') : t('permission.enable')}
      </Button>
    );
  }

  if (status === 'needs-install') {
    messages.push(t('permission.needsInstall'));
    // iOS Safari에는 설치 창(beforeinstallprompt)이 없어 홈 화면에 추가하는 법만 안내할 수 있다.
    if (install.isIOS) {
      messages.push(t('permission.installGuideIOS'));
    } else {
      if (install.canPrompt || install.isPrompting) {
        primary = (
          <Button
            type="button"
            onClick={() => void install.promptInstall()}
            loading={install.isPrompting}
          >
            {install.isPrompting ? t('permission.installing') : t('permission.install')}
          </Button>
        );
      }
      if (install.showManualGuide) {
        messages.push(
          install.isAndroid
            ? t('permission.installGuideAndroid')
            : t('permission.installGuideFallback'),
        );
      }
    }
  }

  // 한 번 거부하면 코드로는 다시 물을 수 없어 설정에서 직접 풀도록 안내한다.
  if (status === 'denied') {
    messages.push(isNative ? t('permission.deniedNative') : t('permission.denied'));
  }

  if (status === 'unsupported') {
    messages.push(t('permission.unsupported'));
  }

  return (
    <BottomSheet open={open} onClose={onClose} aria-label={t('permission.completionTitle')}>
      {art && (
        <div aria-hidden className="mt-1.5 mb-5 flex justify-center">
          {art}
        </div>
      )}
      <h2 className="text-center text-[19px] leading-[1.35] font-extrabold tracking-[-0.025em] text-balance">
        {t('permission.completionTitle')}
      </h2>
      <div className="text-ink-2 mt-1.5 flex flex-col gap-2 text-center text-[13px] leading-[1.6] break-keep">
        {messages.map((message) => (
          <p key={String(message)}>{message}</p>
        ))}
      </div>
      <div className={cn('mt-6 grid gap-2', primary && 'grid-cols-2')}>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('permission.later')}
        </Button>
        {primary}
      </div>
    </BottomSheet>
  );
}

export namespace PushPermissionSheet {
  export type Props = {
    open: boolean;
    onClose: () => void;
    prompt: PermissionPrompt;
    art?: ReactNode;
    afterInstall?: boolean;
  };
}
