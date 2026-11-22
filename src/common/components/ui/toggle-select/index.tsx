import { cn } from '@/common/utils';

export function ToggleSelect({
  available = true,
  stateList,
  state,
  onChange,
  className,
}: ToggleSelect.Props) {
  // stateList 및 state의 정합성 가드 검사
  if (!stateList || stateList.length === 0 || !stateList.includes(state)) {
    return null;
  }

  // 현재 활성화된 탭의 인덱스 탐색
  const activeIndex = stateList.indexOf(state);

  return (
    <div
      role="radiogroup"
      className={cn(
        'bg-soft rounded-tile relative inline-flex w-full max-w-sm p-1 select-none',
        !available && 'opacity-40',
        className,
      )}
    >
      {/* 슬라이딩 백그라운드 스위치 인디케이터 */}
      <div
        className="rounded-seg bg-surface shadow-segment absolute top-1 bottom-1 left-1 transition-all duration-300 ease-out"
        style={{
          width: `calc((100% - 8px) / ${stateList.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {stateList.map((item) => {
        const isActive = item === state;

        return (
          <button
            key={item}
            type="button"
            disabled={!available}
            role="radio"
            aria-checked={isActive}
            onClick={() => available && onChange(item)}
            className={cn(
              'rounded-seg text-body relative z-10 h-10 flex-1 px-4 text-center font-bold transition-colors duration-300',
              'focus-visible:outline-ink focus-visible:outline-2',
              isActive ? 'text-ink' : 'text-ink2',
            )}
          >
            {item}
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
    className?: string;
  };
}
