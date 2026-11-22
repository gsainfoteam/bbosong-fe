import { useState } from 'react';

import { Link } from '@tanstack/react-router';

import { ChevronRight, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LanguageToggle, ListGroup, ListRow, Modal, TopBar } from '@/common/components';
import { cn } from '@/common/utils';
import { NotificationSettingRow } from '@/features/push-notification';

import { type UserProfile } from '../../viewmodels';

export function MypageScreen({
  user,
  notification,
  onBack,
  onLogout,
  isLoggingOut,
  onWithdraw,
  isWithdrawing = false,
  className,
}: MyPageScreen.Props) {
  const { t } = useTranslation('mypage');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const gender = {
    male: t('male'),
    female: t('female'),
  } satisfies Record<NonNullable<UserProfile['gender']>, string>;

  return (
    <div className={cn('bg-surface flex min-h-dvh w-full flex-1 flex-col', className)}>
      <TopBar onBack={onBack} />

      <div className="pb-cta flex flex-1 flex-col gap-2.5 px-5">
        <h1 className="mt-1.5 mb-2 text-[28px] font-extrabold tracking-[-0.03em]">{t('title')}</h1>

        {/* data-amp-mask: Amplitude 자동 수집 시 이름·학번·이메일 텍스트를 가린다 */}
        <ListGroup title={t('account')}>
          <div data-amp-mask>
            <ListRow label={t('name')} value={user.name} />
            <ListRow label={t('studentNumber')} value={user.studentNumber} />
            <ListRow label={t('email')} value={user.email} />
            <ListRow label={t('gender')} value={user.gender ? gender[user.gender] : ''} />
          </div>
        </ListGroup>

        <ListGroup title={t('settings')} className="mt-3">
          <ListRow label={t('language')} trailing={<LanguageToggle size="s" />} />
          <NotificationSettingRow {...notification} />
        </ListGroup>

        <ListGroup className="mt-3">
          {user.role === 'admin' && (
            <ListRow
              asChild
              label={
                <>
                  {t('toAdmin')}
                  <span aria-hidden className="text-ink-3 ml-1.5 text-[11.5px] font-bold">
                    {t('adminTag')}
                  </span>
                </>
              }
              trailing={
                <ChevronRight size={18} strokeWidth={2.2} className="text-ink-3" aria-hidden />
              }
            >
              <Link to="/admin" />
            </ListRow>
          )}
          <ListRow
            asChild
            label={t('feedback')}
            trailing={
              <ExternalLink size={17} strokeWidth={2.1} className="text-ink-3" aria-hidden />
            }
          >
            <a
              href={`https://cs.gistory.me/?service=bbosong&email=${encodeURIComponent(user.email)}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          </ListRow>
          <ListRow asChild label={isLoggingOut ? t('loggingOut') : t('logout')}>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="disabled:opacity-50"
            />
          </ListRow>
        </ListGroup>

        <ListGroup>
          <ListRow asChild tone="danger" label={t('withdraw')}>
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              disabled={isWithdrawing}
              className="disabled:opacity-50"
            />
          </ListRow>
        </ListGroup>

        <p className="text-ink-3 mx-1 mt-2 text-[12.5px]">
          {t('version', { version: __APP_VERSION__ })}
        </p>
      </div>

      {withdrawModalOpen && (
        <Modal
          title={t('withdrawConfirmTitle')}
          description={t('withdrawConfirmDescription')}
          confirmText={isWithdrawing ? t('withdrawing') : t('withdrawConfirm')}
          isPending={isWithdrawing}
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
    notification: NotificationSettingRow.Props;
    onBack: () => void;
    onLogout: () => void;
    isLoggingOut?: boolean;
    onWithdraw: () => void;
    isWithdrawing?: boolean;
    className?: string;
  };
}
