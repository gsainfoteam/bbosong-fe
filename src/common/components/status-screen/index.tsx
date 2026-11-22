import { type ComponentProps, type ReactNode } from 'react';

import { type LucideIcon } from 'lucide-react';

import { cn } from '@/common/utils';

export function StatusScreen({
  icon: Icon,
  title,
  description,
  detail,
  children,
  className,
  ...props
}: StatusScreen.Props & Omit<ComponentProps<'div'>, 'title'>) {
  return (
    <div className={cn('bg-surface flex min-h-dvh w-full flex-1 flex-col', className)} {...props}>
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
        <span
          aria-hidden
          className="bg-soft text-ink-3 border-off-rim grid size-18 place-items-center rounded-full border-[1.4px] border-dashed"
        >
          <Icon size={30} strokeWidth={2} />
        </span>
        <h1 className="mt-6 text-[23px] leading-[1.38] font-extrabold tracking-[-0.03em] text-balance">
          {title}
        </h1>
        {description && <p className="text-ink-2 mt-2 text-[15px] leading-[1.6]">{description}</p>}
        {detail && <p className="text-ink-3 mt-3 text-[12.5px] break-all">{detail}</p>}
      </div>
      {children && (
        <div className="pb-cta grid auto-cols-fr grid-flow-col gap-2 px-5">{children}</div>
      )}
    </div>
  );
}

export namespace StatusScreen {
  export type Props = {
    icon: LucideIcon;
    title: ReactNode;
    description?: ReactNode;
    detail?: ReactNode;
    children?: ReactNode;
    className?: string;
  };
}
