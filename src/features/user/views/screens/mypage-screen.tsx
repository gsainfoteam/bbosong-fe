import { useTranslation } from 'react-i18next';

import { MyPageHeader } from '@/common/components';
import { cn } from '@/common/utils';
import type { Gender } from '@/features/auth';

export function MypageScreen({
  user,
  onLogout,
  isLoggingOut,
  className,
  ...props
}: MyPageScreen.Props) {
  const { t } = useTranslation('mypage');
  //t('male');
  //t('female');

  return (
    <div className={cn('bg-bg flex h-dvh w-full flex-col', className)} {...props}>
      <MyPageHeader />
      
      <div className="flex flex-1 flex-col px-6 pb-6">
        <h1 className="mb-5">{t('account')}</h1>
        <div className="text-text-secondary flex flex-col gap-1 px-2.5">
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

        <div className="mt-auto">
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full rounded-md bg-bg-surface py-3.5 text-center text-text-primary font-medium disabled:opacity-50"
          >
            {isLoggingOut ? t('loggingOut') : t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

export namespace MyPageScreen {
  export type Props = {
    user: {
      name: string;
      studentNumber: string;
      email: string;
      gender: Gender;
    };
    onLogout: () => void;
    isLoggingOut?: boolean;
    className?: string;
  };
}