import { cn } from '@/common/utils';

export function ToggleBoolean({
  available = true,
  state,
  onChange,
  tone = 'ink',
  className,
  ...props
}: ToggleBoolean.Props & Omit<React.ComponentProps<'button'>, 'onChange'>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={state}
      disabled={!available}
      onClick={() => available && onChange?.()}
      className={cn(
        'flex h-[30px] w-[50px] shrink-0 cursor-pointer rounded-full p-[3px] transition-colors duration-200',
        'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-40',
        state ? ToggleBoolean.ON[tone] : 'bg-track',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'shadow-knob size-6 rounded-full bg-white transition-transform duration-200',
          state && 'translate-x-5',
        )}
      />
    </button>
  );
}

export namespace ToggleBoolean {
  // 켜진 색은 놓인 자리를 따른다. 흰 바탕이면 먹색, 기기 배너 안이면 그 기기의 진한 색.
  export const ON = {
    ink: 'bg-ink',
    sky: 'bg-sky-deep',
    orange: 'bg-orange-deep',
  } as const;

  export type Props = {
    available?: boolean;
    state: boolean;
    onChange?: () => void;
    tone?: keyof typeof ON;
    className?: string;
  };
}
