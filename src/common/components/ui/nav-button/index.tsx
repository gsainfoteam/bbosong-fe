import { Link } from '@tanstack/react-router';

import navActive from '@/assets/nav-active.svg';
import { cn } from '@/common/utils';

export function NavButton({ to, label, className, ...props }: NavButton.Props) {
  return (
    <Link
      to={to}
      className={cn('relative flex items-center justify-center p-2', className)}
      style={{ width: 75, height: 60 }}
      {...props}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <img
              src={navActive}
              alt="navActive"
              className="absolute inset-0 h-full w-full object-contain"
            />
          )}
          <span className="text-caption z-10 text-xs font-semibold text-white">{label}</span>
        </>
      )}
    </Link>
  );
}

export namespace NavButton {
  export type Props = {
    to: string;
    label: string;
    className?: string;
  };
}
