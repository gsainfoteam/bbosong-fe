import {
  Children,
  cloneElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ChevronRight } from 'lucide-react';

import { cn } from '@/common/utils';

import { Slot } from '../slot';

/** 연한 면 하나에 행을 묶어 담는 목록. 행 사이에는 가는 구분선이 들어간다. */
export function ListGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('bg-soft rounded-banner divide-line divide-y px-4', className)} {...props} />
  );
}

/**
 * 목록의 한 줄. 높이 54, 왼쪽에 이름, 오른쪽에 값이나 화살표를 둔다.
 * - 값만 보여 주면 div, `onClick`이 있으면 button으로 그린다.
 * - 링크는 `asChild`로 `<a>`/`<Link>`를 넘기면 그 요소가 행이 된다. (자식의 내용은 행이 채운다)
 */
export function ListRow({
  label,
  value,
  trailing,
  chevron = false,
  danger = false,
  asChild = false,
  className,
  children,
  ...props
}: ListRow.Props) {
  const content = (
    <>
      <span className={cn('min-w-0 flex-1 font-medium', danger && 'text-danger font-bold')}>
        {label}
      </span>
      {value !== undefined && <span className="text-ink2 min-w-0 truncate">{value}</span>}
      {trailing}
      {chevron && <ChevronRight size={20} className="text-ink3 shrink-0" aria-hidden />}
    </>
  );

  const rowClass = cn(
    'text-body-lg flex min-h-13.5 w-full items-center gap-3 text-left',
    (asChild || props.onClick) &&
      'focus-visible:outline-ink cursor-pointer focus-visible:outline-2',
    'disabled:text-ink3 disabled:cursor-not-allowed',
    className,
  );

  if (asChild) {
    const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;

    return (
      <Slot className={rowClass} {...props}>
        {cloneElement(child, undefined, content)}
      </Slot>
    );
  }

  if (props.onClick) {
    return (
      <button type="button" className={rowClass} {...props}>
        {content}
      </button>
    );
  }

  return (
    <div className={rowClass} {...(props as ComponentProps<'div'>)}>
      {content}
    </div>
  );
}

export namespace ListRow {
  export type Props = {
    label: ReactNode;
    /** 오른쪽에 보여 줄 값 (이름, 학번처럼 읽기만 하는 내용) */
    value?: ReactNode;
    /** 오른쪽에 둘 컨트롤 (스위치 등) */
    trailing?: ReactNode;
    /** 다른 화면으로 가는 줄이면 true */
    chevron?: boolean;
    /** 되돌릴 수 없는 동작(탈퇴)의 줄 */
    danger?: boolean;
    /** true면 자식 요소(예: Link)가 행이 된다. */
    asChild?: boolean;
    children?: ReactElement;
  } & Omit<ComponentProps<'button'>, 'children' | 'value'>;
}
