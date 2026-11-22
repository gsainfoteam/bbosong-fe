import { cn } from '@/common/utils';

export function ToggleSelect({
  available = true,
  stateList,
  state,
  onChange,
  getLabel = (item) => item,
  size = 'm',
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
        'grid auto-cols-fr grid-flow-col select-none',
        ToggleSelect.TRACK[size],
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
              'font-bold transition-[background-color,color,box-shadow] duration-200',
              ToggleSelect.ITEM[size],
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
  export const TRACK = {
    m: 'w-full rounded-[14px] bg-soft p-1',
    s: 'rounded-[11px] bg-[#e9eaed] p-[3px]',
  } as const;

  export const ITEM = {
    m: 'h-10 rounded-[11px] text-sm',
    s: 'h-[30px] rounded-[9px] px-[11px] text-[13px]',
  } as const;

  export type Props = {
    available?: boolean;
    stateList: string[];
    state: string;
    onChange: (state: string) => void;
    getLabel?: (state: string) => React.ReactNode;
    size?: keyof typeof TRACK;
    className?: string;
  };
}
