import { cn } from '@/common/utils';
import type { Gender } from '@/features/auth';
import { MyPageHeader } from '@/common/components';
import { useTranslation } from 'react-i18next';

export function MypageScreen({ user, className, ...props }: MyPageScreen.Props) {
  const { t } = useTranslation('mypage');
  return (
    <div className={cn('bg-bg h-dvh w-full', className)} {...props}>
      <MyPageHeader />
      <div className='px-6'>
        <h1 className='mb-5'>{t('account')}</h1>
        <div className='px-2.5 flex flex-col gap-1 text-text-secondary'>
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
            {t('gender')}: {user.gender}
          </p>
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
    className?: string;
  };
}
