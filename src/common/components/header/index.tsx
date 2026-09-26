import { useTranslation } from 'react-i18next';
import { cn } from '@/common/utils';
import { Menu } from 'lucide-react';

export const Header = ({className, ...props}: Header.Props) => {
  const { t } = useTranslation('common');

  return (
    <header className={cn(className, "flex justify-between p-2 w-full text-text-primary bg-primary-light")} {...props}>
      <h2>{t('bbosong')}</h2>
      <Menu />
    </header>
  )
}

export namespace Header {
  export type Props = {
    className?: string;
  }
}