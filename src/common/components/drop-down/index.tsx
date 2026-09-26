import { useEffect, useId, useRef, useState, type ComponentProps } from 'react';

import { type ParseKeys } from 'i18next';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

export function DropDown({
  items,
  onSelect,
  value,
  placeholder,
  disabled = false,
  className,
  ...props
}: DropDown.Props & Omit<ComponentProps<'div'>, 'onSelect'>) {
  const { t } = useTranslation(['location', 'common']);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // t('location:a')
  // t('location:b')
  // t('location:laundryRoom')

  // 메뉴 바깥 클릭 및 Escape 입력 시 닫기
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative inline-block w-full', className)} {...props}>
      <button
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          // 'border-border bg-bg rounded-lg border',
          'bg-white',
          'text-body-lg text-text-primary flex w-full items-center justify-between gap-2 px-4 py-2 transition-colors',
          disabled && 'text-text-secondary cursor-not-allowed opacity-50',
        )}
      >
        <span className={cn('truncate', value === undefined && 'text-text-secondary')}>
          {value ? t(`location:${value}`) : (placeholder ?? t('common:dropDown.placeholder'))}
        </span>
        <ChevronDown
          aria-hidden
          className={cn('size-5 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="border-border bg-bg absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border py-1 shadow-md"
        >
          {items.map((item) => {
            const isSelected = item === value;

            return (
              <li key={item}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className="text-body-lg text-text-primary hover:bg-bg-surface flex w-full items-center gap-2 px-4 py-2 text-left transition-colors"
                >
                  <Check
                    aria-hidden
                    strokeWidth={3}
                    className={cn('size-4 shrink-0', !isSelected && 'invisible')}
                  />
                  <span className="truncate">{t(`location:${item}`)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export namespace DropDown {
  export type Props = {
    items: Array<ParseKeys<'location'>>;
    onSelect: (item: ParseKeys<'location'>) => void;
    value?: ParseKeys<'location'>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
  };
}
