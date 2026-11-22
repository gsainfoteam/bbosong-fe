import { useState } from 'react';

import { Link } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { LanguageToggle, Modal, MyPageHeader } from '@/common/components';
import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils';
import { PushPermissionCard } from '@/features/push-notification';

import { type UserProfile } from '../../viewmodels';

export function MypageScreen({
  user,
  onLogout,
  isLoggingOut,
  onWithdraw,
  isWithdrawing = false,
  className,
  ...props
}: MyPageScreen.Props) {
  const { t } = useTranslation('mypage');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  //t('male');
  //t('female');

  return (
    <div className={cn('bg-surface flex w-full flex-1 flex-col', className)} {...props}>
      <MyPageHeader />

      <div className="flex flex-1 flex-col px-6 pb-6">
        <h1 className="mb-5">{t('account')}</h1>
        {/* data-amp-mask: Amplitude 자동 수집 시 이름·학번·이메일 텍스트를 가린다 */}
        <div data-amp-mask className="text-ink2 flex flex-col gap-1 px-2.5">
          <p>
            {t('name')}: {user.name}
          </p>
          <p>
            {t('studentNumber')}: {user.studentNumber}
          </p>
          <p>
            {t('email')}: {user.email}
          </p>
          <p>
            {t('gender')}: {user.gender ? t(user.gender) : ''}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2>{t('language')}</h2>
          <LanguageToggle />
        </div>

        <PushPermissionCard className="mt-8" />

        <div className="mt-auto flex flex-col gap-3">
          {user.role === 'admin' && (
            <Button asChild variant="secondary" className="w-full">
              <Link to="/admin">{t('toAdmin')}</Link>
            </Button>
          )}
          <Button asChild variant="secondary" className="w-full">
            <a
              href={`https://cs.gistory.me/?service=bbosong&email=${encodeURIComponent(user.email)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('feedback')}
            </a>
          </Button>
          <Button variant="secondary" onClick={onLogout} loading={isLoggingOut} className="w-full">
            {isLoggingOut ? t('loggingOut') : t('logout')}
          </Button>
          <Button
            variant="text-danger"
            size="s"
            onClick={() => setWithdrawModalOpen(true)}
            disabled={isWithdrawing}
            className="mx-auto"
          >
            {t('withdraw')}
          </Button>
        </div>

        <p className="text-ink2 mt-4 text-center text-sm">
          {t('version', { version: __APP_VERSION__ })}
        </p>
      </div>

      {withdrawModalOpen && (
        <Modal
          title={t('withdrawConfirmTitle')}
          description={t('withdrawConfirmDescription')}
          confirmText={isWithdrawing ? t('withdrawing') : t('withdrawConfirm')}
          isPending={isWithdrawing}
          confirmVariant="danger"
          onConfirm={onWithdraw}
          onClose={() => setWithdrawModalOpen(false)}
        />
      )}
    </div>
  );
}

export namespace MyPageScreen {
  export type Props = {
    user: UserProfile;
    onLogout: () => void;
    isLoggingOut?: boolean;
    onWithdraw: () => void;
    isWithdrawing?: boolean;
    className?: string;
  };
}
