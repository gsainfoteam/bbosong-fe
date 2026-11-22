import { cn } from '@/common/utils';

export function ToggleBoolean({
  available = true,
  state,
  onChange,
  tone = 'default',
  className,
  ...props
}: ToggleBoolean.Props) {
  const handleClick = () => {
    if (available && onChange) {
      onChange();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex h-7.5 w-12.5 shrink-0 cursor-pointer rounded-full p-0.75 transition-colors duration-200 ease-in-out',
        'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
        state ? ToggleBoolean.onColor[tone] : 'bg-track',
        state ? 'justify-end' : 'justify-start',
        !available && 'cursor-not-allowed opacity-40',
        className,
      )}
      role="switch"
      aria-checked={state}
      disabled={!available}
      {...props}
    >
      <span className="shadow-knob pointer-events-none block size-6 rounded-full bg-white" />
    </button>
  );
}

export namespace ToggleBoolean {
  /** 켜진 색은 놓인 자리를 따른다. 흰 바탕이면 먹색, 기기 배너 안이면 그 기기의 진한 색. */
  export type Tone = 'default' | 'washer' | 'dryer';

  export const onColor: Record<Tone, string> = {
    default: 'bg-ink',
    washer: 'bg-sky-deep',
    dryer: 'bg-orange-deep',
  };

  export type Props = {
    available?: boolean;
    state: boolean;
    onChange?: () => void;
    tone?: Tone;
    className?: string;
  };
}
