import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function WelcomeMessage({text, className, ...props}: WelcomeMessage.Props) {
  const { t } = useTranslation();

  return (
    <p className={cn('', className)} {...props}>{t('user.mypage.welcome', {name: text})}</p>
  );
}

export namespace WelcomeMessage {
  export type Props = {
    text: string;
    className?: string;
  }
}