import React, { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@/common/components';
import { cn } from '@/common/utils';

import { useInstallPrompt, usePushPermission } from '../viewmodels';

export function PushPermissionCard({
  className,
  presentation = 'card',
  afterInstall = false,
  art,
  onLater,
  ...props
}: PushPermissionCard.Props) {
  const { t } = useTranslation('notification');
  const { status, isRequesting, requestPermission, isNative } = usePushPermission();
  const { canPrompt, isPrompting, promptInstall, showManualGuide, isIOS, isAndroid } =
    useInstallPrompt();

  if (status === 'granted') return null;

  const isSheet = presentation === 'sheet';
  const paragraph = isSheet ? 'text-body text-ink-2 leading-relaxed' : 'text-sm';

  // 지금 상태에서 누를 수 있는 주 동작. 없으면 안내만 보여 준다.
  let primary: ReactNode = null;
  const messages: ReactNode[] = [];

  if (status === 'unsupported') {
    messages.push(<p key="unsupported">{t('permission.unsupported')}</p>);
  }

  // 한 번 denied가 되면 코드로 되돌릴 수 없고 브라우저 설정에서 직접 풀어야 한다
  if (status === 'denied') {
    messages.push(
      <p key="denied">{t(isNative ? 'permission.deniedNative' : 'permission.denied')}</p>,
    );
  }

  // 모든 플랫폼에서 앱 설치를 알림 활성화의 선행 조건으로 요구한다
  if (status === 'needs-install') {
    messages.push(<p key="needs-install">{t('permission.needsInstall')}</p>);
    // iOS Safari는 beforeinstallprompt가 없어 수동 안내만 가능하다
    if (isIOS) messages.push(<p key="ios">{t('permission.installGuideIOS')}</p>);
    if (!isIOS && (canPrompt || isPrompting)) {
      primary = (
        <Button type="button" onClick={() => void promptInstall()} loading={isPrompting}>
          {isPrompting ? t('permission.installing') : t('permission.install')}
        </Button>
      );
    }
    // 자동 설치를 사용할 수 없거나 실패하면 현재 기기에 맞는 수동 설치를 안내한다
    if (!isIOS && showManualGuide) {
      messages.push(
        <p key="manual" role="status">
          {isAndroid ? t('permission.installGuideAndroid') : t('permission.installGuideFallback')}
        </p>,
      );
    }
  }

  if (status === 'default') {
    messages.push(
      <p key="default">
        {isSheet && !afterInstall
          ? t('permission.completionDescription')
          : t('permission.description')}
      </p>,
    );
    // 권한 요청은 사용자가 명시적으로 누른 시점에만 발생해야 한다
    primary = (
      <Button type="button" onClick={() => void requestPermission()} loading={isRequesting}>
        {isRequesting ? t('permission.requesting') : t('permission.enable')}
      </Button>
    );
  }

  const later = onLater && (
    <Button type="button" variant="secondary" onClick={onLater}>
      {t('permission.later')}
    </Button>
  );
  const hasActions = Boolean(primary || later);

  return (
    <section
      className={cn('text-ink flex flex-col', !isSheet && 'gap-3 rounded-lg', className)}
      {...props}
    >
      {isSheet && art && (
        <div aria-hidden className="mt-2 mb-5 flex justify-center">
          {art}
        </div>
      )}

      <h2 className={cn(isSheet ? 'text-heading text-center' : 'text-body-strong')}>
        {isSheet ? t('permission.completionTitle') : t('permission.title')}
      </h2>

      <div className={cn('flex flex-col gap-2', paragraph, isSheet && 'mt-1.5 text-center')}>
        {messages}
      </div>

      {hasActions && (
        // 시트는 "나중에 | 주 동작" 두 칸, 카드는 주 동작 한 칸이다
        <div
          className={cn(
            'grid gap-2',
            isSheet ? 'mt-6' : '',
            later && primary ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {later}
          {primary}
        </div>
      )}
    </section>
  );
}

export namespace PushPermissionCard {
  export type Props = {
    className?: string;
    presentation?: 'card' | 'sheet';
    afterInstall?: boolean;
    /** 시트 위에 놓을 일러스트. 장식이라 스크린리더에서는 숨긴다. */
    art?: ReactNode;
    /** 있으면 "나중에" 버튼을 주 동작 옆에 함께 그린다. */
    onLater?: () => void;
  } & React.HTMLAttributes<HTMLElement>;
}
