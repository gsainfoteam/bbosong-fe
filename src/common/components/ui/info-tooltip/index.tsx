import { useId } from 'react';

import { Info } from 'lucide-react';

import { cn } from '@/common/utils';

export function InfoTooltip({ label, content, className }: InfoTooltip.Props) {
  const tooltipId = useId();

  return (
    <span className={cn('group relative inline-flex align-middle', className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={tooltipId}
        className="text-ink2 hover:text-ink focus-visible:text-ink inline-flex cursor-help rounded-full focus:outline-none dark:text-slate-400"
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="rounded-chip bg-ink text-caption pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 px-3 py-2 text-left leading-relaxed whitespace-normal text-white opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}

export namespace InfoTooltip {
  export type Props = {
    /** 버튼의 접근성 라벨 (보통 용어 이름) */
    label: string;
    /** 툴팁에 표시할 설명 */
    content: string;
    className?: string;
  };
}
