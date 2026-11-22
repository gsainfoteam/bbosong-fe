import { useState } from 'react';

import { Link } from '@tanstack/react-router';

import { useTranslation } from 'react-i18next';

import { LanguageToggle, Modal, MyPageHeader } from '@/common/components';
import { ListGroup, ListRow } from '@/common/components/ui/list-group';
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

  const sectionTitle = 'text-label text-ink2 mt-5.5 mb-2 ml-1';

  return (
    <div className={cn('bg-surface flex w-full flex-1 flex-col', className)} {...props}>
      <MyPageHeader />

      <div className="flex flex-1 flex-col px-5 pb-8">
        <h1 className="text-display mt-3.5 mb-5.5">{t('title')}</h1>

        <h2 className={cn(sectionTitle, 'mt-0')}>{t('account')}</h2>
        {/* data-amp-mask: Amplitude 자동 수집 시 이름·학번·이메일 텍스트를 가린다 */}
        <ListGroup data-amp-mask>
          <ListRow label={t('name')} value={user.name} />
          <ListRow label={t('studentNumber')} value={user.studentNumber} />
          <ListRow label={t('email')} value={user.email} />
          <ListRow label={t('gender')} value={user.gender ? t(user.gender) : ''} />
        </ListGroup>

        <h2 className={sectionTitle}>{t('language')}</h2>
        <LanguageToggle variant="segment" />

        {/* 알림 권한이 이미 허용돼 있으면 아무것도 그리지 않는다. 제목은 카드가 갖고 있다. */}
        <PushPermissionCard className="bg-soft rounded-banner mt-5.5 p-4" />

        <ListGroup className="mt-5.5">
          {user.role === 'admin' && (
            <ListRow asChild chevron label={t('toAdmin')}>
              <Link to="/admin" />
            </ListRow>
          )}
          <ListRow asChild chevron label={t('feedback')}>
            <a
              href={`https://cs.gistory.me/?service=bbosong&email=${encodeURIComponent(user.email)}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          </ListRow>
          <ListRow
            label={isLoggingOut ? t('loggingOut') : t('logout')}
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          />
        </ListGroup>

        {/* 되돌릴 수 없는 동작은 따로 떼어 맨 아래에 둔다 */}
        <ListGroup className="mt-2.5">
          <ListRow
            danger
            label={t('withdraw')}
            onClick={() => setWithdrawModalOpen(true)}
            disabled={isWithdrawing}
          />
        </ListGroup>

        <p className="text-caption text-ink3 mt-5 ml-1">
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
