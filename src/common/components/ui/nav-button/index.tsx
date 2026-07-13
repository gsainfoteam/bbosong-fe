import { Link } from '@tanstack/react-router';

import navActive from '@/assets/nav-active.svg';
import { cn } from '@/common/utils';

export function NavButton({ to, label, isActive, className, ...props }: NavButton.Props) {
  return (
    <Link
      to={to}
      className={cn(
        'text-text-secondary flex flex-col items-center gap-1 p-2',
        className,
      )}
      {...props}
    >
      {isActive && <img src={navActive} alt='navActive'/>}
      <span className="text-caption">{label}</span>
    </Link>
  );
}

export namespace NavButton {
  export type Props = {
    to: string;
    label: string;
    isActive?: boolean;
    className?: string;
  };
}
