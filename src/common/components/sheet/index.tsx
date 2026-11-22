import { type ComponentProps } from 'react';

import { cn } from '@/common/utils';

/** 고르거나 권하는 내용을 아래에서 올려 보여 주는 시트. 위에 그랩 핸들이 붙는다. */
export function Sheet({ className, children, ...props }: Sheet.Props) {
  return (
    <dialog
      className={cn(
        'bg-surface text-ink shadow-sheet rounded-t-sheet backdrop:bg-ink/44 fixed inset-x-0 top-auto bottom-0 mx-auto my-0 max-h-[85dvh] w-full max-w-120 overflow-y-auto border-0 px-5 pt-2.5 pb-[max(1.75rem,env(safe-area-inset-bottom))]',
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
