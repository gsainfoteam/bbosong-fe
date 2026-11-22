import { useTranslation } from 'react-i18next';

import { Button, ListRow, ToggleBoolean } from '@/common/components';

import { type PushPermissionStatus } from '../viewmodels';

// 허용한 알림 권한은 코드로 거둘 수 없어, 켜진 스위치는 끄지 않고 기기 설정으로 안내한다.
export function NotificationSettingRow({
  status,
  isNative = false,
  isBusy = false,
  onEnable,
  onTurnOffHint,
  onInstall,
  installGuide,
}: NotificationSettingRow.Props) {
  const { t } = useTranslation('notification');
  const label = t('permission.settingLabel');

  const note = (text: string | undefined) =>
    text && <p className="text-ink-2 -mt-1 pb-3.5 text-[13px] leading-[1.5]">{text}</p>;

  switch (status) {
    case 'granted':
    case 'default':
      return (
        <ListRow
          label={label}
          trailing={
            <ToggleBoolean
              state={status === 'granted'}
              available={!isBusy}
              aria-label={label}
              onChange={status === 'granted' ? onTurnOffHint : onEnable}
            />
          }
        />
      );
    case 'needs-install':
      return (
        <>
          <ListRow
            label={label}
            trailing={
              onInstall && (
                <Button
                  type="button"
                  variant="outline"
                  size="s"
                  disabled={isBusy}
                  onClick={onInstall}
                >
                  {isBusy ? t('permission.installing') : t('permission.install')}
                </Button>
              )
            }
          />
          {note(installGuide ?? t('permission.needsInstall'))}
        </>
      );
    case 'denied':
      return (
        <>
          <ListRow
            label={label}
            value={<span className="text-ink-3">{t('permission.openSettings')}</span>}
          />
          {note(isNative ? t('permission.deniedNative') : t('permission.denied'))}
        </>
      );
    case 'unsupported':
      return (
        <ListRow
          label={label}
          value={<span className="text-ink-3">{t('permission.unsupportedShort')}</span>}
        />
      );
  }
}

export namespace NotificationSettingRow {
  export type Props = {
    status: PushPermissionStatus;
    isNative?: boolean;
    isBusy?: boolean;
    onEnable: () => void;
    onTurnOffHint: () => void;
    onInstall?: () => void;
    installGuide?: string;
  };
}
