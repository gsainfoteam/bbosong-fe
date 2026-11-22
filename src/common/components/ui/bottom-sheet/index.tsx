import { type ReactNode, useRef } from 'react';

import { Drawer } from '@base-ui/react/drawer';

import { cn } from '@/common/utils';

export function BottomSheet({
  open,
  onClose,
  title,
  'aria-label': ariaLabel,
  children,
  className,
}: BottomSheet.Props) {
  // 첫 버튼에 포커스가 가면 열자마자 포커스 테두리가 떠서, 시트 자체에 포커스를 둔다.
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="bg-ink/44 ease-sheet fixed inset-0 z-40 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-450 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <Drawer.Popup
            ref={popupRef}
            initialFocus={popupRef}
            aria-label={ariaLabel}
            className={cn(
              'bg-surface shadow-overlay rounded-t-sheet ease-sheet w-full max-w-120 translate-y-(--drawer-swipe-movement-y) px-5 pt-2.5 pb-[max(28px,env(safe-area-inset-bottom))] outline-none',
              'transition-transform duration-450 data-ending-style:translate-y-full data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-starting-style:translate-y-full data-swiping:select-none',
              className,
            )}
          >
            <div aria-hidden className="bg-track mx-auto mb-5 h-[5px] w-9 rounded-full" />
            {title && (
              <Drawer.Title className="mb-6 text-[19px] font-extrabold tracking-[-0.025em]">
                {title}
              </Drawer.Title>
            )}
            <Drawer.Content>{children}</Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export namespace BottomSheet {
  export type Props = {
    open: boolean;
    /** 바깥 누르기, 아래로 밀기, Escape 어느 쪽으로 닫혀도 불린다 */
    onClose: () => void;
    title?: ReactNode;
    /** 보이는 제목 없이 안쪽 내용이 제목 역할을 할 때 쓴다 */
    'aria-label'?: string;
    children: ReactNode;
    className?: string;
  };
}
