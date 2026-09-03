import { forwardRef, type ComponentProps } from 'react';

import { Check } from 'lucide-react';

import { cn } from '@/common/utils';

export const Checkbox = forwardRef<
  HTMLInputElement,
  Checkbox.Props & Omit<ComponentProps<'input'>, 'type'>
>(({ className, ...props }, ref) => (
  <span className={cn('group relative inline-flex cursor-pointer items-center', className)}>
    <input
      ref={ref}
      className="peer absolute inset-0 z-10 size-5 cursor-pointer opacity-0 focus-visible:outline-none"
      {...props}
      type="checkbox"
    />
    <span
      aria-hidden
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
        'border-border peer-checked:border-primary peer-checked:bg-primary',
        'peer-focus-visible:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
        'pointer-events-none',
      )}
    >
      <Check
        className="text-text-white invisible size-3.5 group-has-checked:visible"
        strokeWidth={3}
        aria-hidden
      />
    </span>
  </span>
));

export namespace Checkbox {
  export type Props = {};
}
