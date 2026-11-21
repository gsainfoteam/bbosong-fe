import { cn } from '@/common/utils';

export function ToggleSelect({
  available = true,
  stateList,
  state,
  onChange,
  getLabel = (item) => item,
  className,
  ...props
}: ToggleSelect.Props & Omit<React.ComponentProps<'div'>, 'onChange'>) {
  if (!stateList || stateList.length === 0 || !stateList.includes(state)) {
    return null;
  }

  return (
    <div
      role="radiogroup"
      className={cn(
        'bg-soft grid w-full auto-cols-fr grid-flow-col rounded-[14px] p-1 select-none',
        !available && 'opacity-50',
        className,
      )}
      {...props}
    >
      {stateList.map((item) => {
        const isActive = item === state;

        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={!available}
            onClick={() => available && onChange(item)}
            className={cn(
              'h-10 rounded-[11px] text-sm font-bold transition-[background-color,color,box-shadow] duration-200',
              'focus-visible:outline-ink focus-visible:outline-2 focus-visible:-outline-offset-2',
              isActive ? 'text-ink bg-white shadow-[0_1px_3px_rgb(27_29_33/0.12)]' : 'text-ink-2',
            )}
          >
            {getLabel(item)}
          </button>
        );
      })}
    </div>
  );
}

export namespace ToggleSelect {
  export type Props = {
    available?: boolean;
    stateList: string[];
    state: string;
    onChange: (state: string) => void;
    getLabel?: (state: string) => React.ReactNode;
    className?: string;
  };
}
