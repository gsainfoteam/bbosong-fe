import { useTranslation } from 'react-i18next';

import { Button } from '@/common/components';
import { cn } from '@/common/utils';

import { useInstallPrompt, usePushPermission } from '../viewmodels';

export function PushPermissionCard({ className, ...props }: PushPermissionCard.Props) {
  const { t } = useTranslation('notification');
  const { status, isRequesting, requestPermission } = usePushPermission();
  const { canPrompt, isPrompting, promptInstall, isIOS } = useInstallPrompt();

  // 권한이 이미 허용된 상태에서는 아무것도 노출하지 않는다
  if (status === 'granted') return null;

  return (
    <section
      className={cn('text-text-primary flex flex-col gap-3 rounded-lg p-4', className)}
      {...props}
    >
      <h2 className="text-lg font-semibold">{t('permission.title')}</h2>

      {status === 'unsupported' && <p className="text-sm">{t('permission.unsupported')}</p>}

      {/* 한 번 denied가 되면 코드로 되돌릴 수 없고 브라우저 설정에서 직접 풀어야 한다 */}
      {status === 'denied' && <p className="text-sm">{t('permission.denied')}</p>}

      {/* 모든 플랫폼에서 앱 설치를 알림 활성화의 선행 조건으로 요구한다 */}
      {status === 'needs-install' && (
        <>
          <p className="text-sm">{t('permission.needsInstall')}</p>
          {/* iOS Safari는 beforeinstallprompt가 없어 수동 안내만 가능하다 */}
          {isIOS ? (
            <p className="text-sm opacity-80">{t('permission.installGuideIOS')}</p>
          ) : canPrompt ? (
            <Button type="button" onClick={() => void promptInstall()} disabled={isPrompting}>
              {isPrompting ? t('permission.installing') : t('permission.install')}
            </Button>
          ) : (
            // 이미 설치했거나 브라우저가 프롬프트를 내주지 않는 경우의 폴백 안내
            <p className="text-sm opacity-80">{t('permission.installGuideFallback')}</p>
          )}
        </>
      )}

      {status === 'default' && (
        <>
          <p className="text-sm">{t('permission.description')}</p>
          {/* 권한 요청은 사용자가 명시적으로 누른 시점에만 발생해야 한다 */}
          <Button type="button" onClick={() => void requestPermission()} disabled={isRequesting}>
            {isRequesting ? t('permission.requesting') : t('permission.enable')}
          </Button>
        </>
      )}
    </section>
  );
}

export namespace PushPermissionCard {
  export type Props = {
    className?: string;
  } & React.HTMLAttributes<HTMLElement>;
}
