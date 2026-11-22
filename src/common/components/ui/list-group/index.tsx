import { cloneElement, isValidElement, type ReactNode } from 'react';

import { cn } from '@/common/utils';

import { Slot } from '../slot';

export function ListGroup({ title, children, className }: ListGroup.Props) {
  return (
    <section className={className}>
      {title && <h2 className="text-ink-2 mx-1 mb-2 text-[13px] font-bold">{title}</h2>}
      <div className="bg-soft rounded-banner px-4">{children}</div>
    </section>
  );
}

export namespace ListGroup {
  export type Props = {
    title?: ReactNode;
    children: ReactNode;
    className?: string;
  };
}

export function ListRow({
  label,
  value,
  trailing,
  tone = 'default',
  asChild = false,
  children,
  className,
  ...props
}: ListRow.Props & React.HTMLAttributes<HTMLElement>) {
  const content = (
    <>
      <span
        className={cn(
          'min-w-0 flex-1',
          tone === 'danger' ? 'text-danger font-bold' : 'font-medium',
        )}
      >
        {label}
      </span>
      {value !== undefined && <span className="text-ink-2 min-w-0 truncate">{value}</span>}
      {trailing}
    </>
  );

  const rowClass = cn(
    'flex min-h-13 w-full items-center gap-3 text-left text-[15px] [&+&]:border-t [&+&]:border-line',
    asChild && 'transition-opacity active:opacity-60',
    className,
  );

  if (asChild && isValidElement(children)) {
    return (
      <Slot className={rowClass} {...props}>
        {cloneElement(children, undefined, content)}
      </Slot>
    );
  }

  return (
    <div className={rowClass} {...props}>
      {content}
    </div>
  );
}

export namespace ListRow {
  export type Props = {
    label: ReactNode;
    value?: ReactNode;
    trailing?: ReactNode;
    tone?: 'default' | 'danger';
    asChild?: boolean;
    children?: ReactNode;
    className?: string;
  };
}
