import { useEffect, useRef } from 'react';

import { Check, X } from 'lucide-react';
import { Toaster as Sonner, useSonner, type ToasterProps } from 'sonner';

import { haptic } from '@/common/lib/haptic';

/**
 * 새 토스트가 뜰 때 성공/실패에 맞는 진동을 준다.
 * `toast.success`/`toast.error` 호출부마다 넣지 않고 여기서 한 번에 처리한다.
 */
function ToastHaptic() {
  const { toasts } = useSonner();
  const seen = useRef(new Set<string | number>());

  useEffect(() => {
    const alive = new Set(toasts.map((item) => item.id));
    for (const id of seen.current) if (!alive.has(id)) seen.current.delete(id);

    for (const item of toasts) {
      if (seen.current.has(item.id)) continue;
      seen.current.add(item.id);

      if (item.type === 'success') haptic.success();
      else if (item.type === 'error') haptic.error();
    }
  }, [toasts]);

  return null;
}

/** 토스트 앞의 상태 점. 성공은 초록, 실패는 빨강이다. */
function StatusDot({ tone, children }: { tone: 'success' | 'error'; children: React.ReactNode }) {
  return (
    <span
      className={
        tone === 'success'
          ? 'bg-live grid size-5 place-items-center rounded-full text-white'
          : 'bg-danger grid size-5 place-items-center rounded-full text-white'
      }
    >
      {children}
    </span>
  );
}

/**
 * 앱 전체 토스트. 먹색 면에 흰 글자, 앞에 상태 점, 오른쪽에 (있으면) 파란 액션 버튼이 놓인다.
 * `toast.success(...)`, `toast.error(...)`는 그대로 쓰고, 되돌리기 같은 동작은 `action`으로 넘긴다.
 *
 * sonner의 기본 스타일을 끄고(`unstyled`) 클래스로 다시 입힌다.
 * 아이콘·본문 칸은 sonner가 specificity 높은 기본 규칙을 갖고 있어서 `!`로 덮는다.
 */
export function Toaster(props: ToasterProps) {
  return (
    <>
      <ToastHaptic />
      <Sonner
        position="top-center"
        offset={16}
        mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: 20, right: 20 }}
        icons={{
          success: (
            <StatusDot tone="success">
              <Check size={12} strokeWidth={3} aria-hidden />
            </StatusDot>
          ),
          error: (
            <StatusDot tone="error">
              <X size={12} strokeWidth={3} aria-hidden />
            </StatusDot>
          ),
        }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'bg-ink text-body shadow-toast rounded-button flex min-h-13 w-full items-center gap-2.5 pr-2 pl-4 font-semibold text-white',
            icon: 'm-0! size-5! flex-none',
            content: 'min-w-0 flex-1',
            title: 'text-body font-semibold',
            description: 'text-caption text-white/70',
            actionButton:
              'text-sky-water text-label h-9 shrink-0 cursor-pointer rounded-xl bg-transparent px-2.5 font-bold',
            cancelButton:
              'text-label h-9 shrink-0 cursor-pointer rounded-xl bg-transparent px-2.5 font-bold text-white/70',
          },
        }}
        {...props}
      />
    </>
  );
}
