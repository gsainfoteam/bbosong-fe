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
      className={cn(
        'bg-bg-surface relative inline-flex w-full max-w-sm rounded-full p-1 select-none',
        !available && 'opacity-50',
        className,
      )}
    >
      {/* 슬라이딩 백그라운드 스위치 인디케이터 */}
      <div
        className="absolute top-1 bottom-1 left-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-out"
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
            aria-pressed={isActive}
            onClick={() => available && onChange(item)}
            className={cn(
              'relative z-10 flex-1 rounded-full px-4 py-1.5 text-center text-sm font-medium transition-colors duration-300',
              isActive ? 'text-bg' : 'text-gray-500',
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
