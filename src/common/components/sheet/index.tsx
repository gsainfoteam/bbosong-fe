import { type ComponentProps } from 'react';

import { cn } from '@/common/utils';

/**
 * 고르거나 권하는 내용을 아래에서 올려 보여 주는 시트. 위에 그랩 핸들이 붙는다.
 * 열 때는 아래에서 부드럽게 올라오고(280ms) 닫을 때는 같은 길로 내려간다. 배경 가림막도 함께 나타난다.
 * `<dialog>`의 display 전환을 이용하므로 지원하지 않는 웹뷰에서는 모션 없이 바로 열리고 닫힌다.
 */
export function Sheet({ className, children, ...props }: Sheet.Props) {
  return (
    <dialog
      className={cn(
        'bg-surface text-ink shadow-sheet rounded-t-sheet fixed inset-x-0 top-auto bottom-0 mx-auto my-0 max-h-[85dvh] w-full max-w-120 overflow-y-auto border-0 px-5 pt-2.5 pb-[max(1.75rem,env(safe-area-inset-bottom))]',
        // 올라오고 내려가는 모션
        'ease-sheet translate-y-full transition-[translate,overlay,display] transition-discrete duration-280 open:translate-y-0 open:starting:translate-y-full',
        // 배경 가림막이 함께 번졌다 사라진다
        'backdrop:ease-sheet open:backdrop:bg-ink/44 backdrop:bg-transparent backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-280 open:backdrop:starting:bg-transparent',
        'motion-reduce:transition-none motion-reduce:backdrop:transition-none',
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className="bg-track mx-auto mb-5 h-1.25 w-9 rounded-full" />
      {children}
    </dialog>
  );
}

export namespace Sheet {
  export type Props = ComponentProps<'dialog'>;
}
