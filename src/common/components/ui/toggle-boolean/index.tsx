import { cn } from '@/common/utils';

export function ToggleBoolean({
  available = true,
  state,
  onChange,
  size = 'md',
  className,
  ...props
}: ToggleBoolean.Props) {
  const handleClick = () => {
    if (available && onChange) {
      onChange();
    }
  };

  const sizeClasses = {
    md: {
      track: 'h-6 w-11',
      knob: 'h-5 w-5',
      translate: state ? 'translate-x-5' : 'translate-x-0',
    },
    sm: {
      track: 'h-5 w-9',
      knob: 'h-4 w-4',
      translate: state ? 'translate-x-4' : 'translate-x-0',
    },
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
        sizeClasses[size].track,
        state ? 'bg-primary' : 'bg-border-strong',
        !available && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      role="switch"
      aria-checked={state}
      disabled={!available}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          sizeClasses[size].knob,
          sizeClasses[size].translate,
        )}
      />
    </button>
  );
}

export namespace ToggleBoolean {
  export type Props = {
    available?: boolean;
    state: boolean;
    onChange?: () => void;
    size?: 'sm' | 'md';
    className?: string;
  };
}