import { useEffect, useId, useRef } from 'react';

import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';

const SHAPE = { washer: 'rounded-full', dryer: 'rounded-[3px]' } as const;
const COLOR = { washer: 'bg-sky-deep', dryer: 'bg-orange-deep' } as const;

// 빈 자리 수를 글자 대신 기기 모양 점과 숫자로 보인다. 0이면 둘 다 회색으로 물러난다.
function FreeCount({ type, count }: { type: keyof typeof SHAPE; count: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[7px] text-[22px] leading-none font-bold',
        count === 0 && 'text-ink-3',
      )}
    >
      <i
        className={cn('size-[11px] shrink-0', SHAPE[type], count === 0 ? 'bg-track' : COLOR[type])}
      />
      <span className="font-num tracking-[-0.01em]">{count}</span>
    </span>
  );
}

export function RoomSheet({ open, rooms, onSelect, onClose }: RoomSheet.Props) {
  const { t } = useTranslation('main');
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="bg-ink/44 fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
            aria-modal
            aria-labelledby={titleId}
            className="bg-surface shadow-overlay rounded-t-sheet fixed inset-x-0 bottom-0 z-50 mx-auto max-w-120 px-5 pt-2.5 pb-[max(28px,env(safe-area-inset-bottom))] outline-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
          >
            <div className="bg-track mx-auto mb-5 h-[5px] w-9 rounded-full" />
            <h3 id={titleId} className="mb-6 text-[19px] font-extrabold tracking-[-0.025em]">
              {t('switchRoom')}
            </h3>
            <div role="radiogroup" aria-labelledby={titleId} className="grid grid-cols-2 gap-2.5">
              {rooms.map((room) => (
                <button
                  key={room.location}
                  type="button"
                  role="radio"
                  aria-checked={room.selected}
                  aria-label={t('roomFree', {
                    room: room.label,
                    washer: String(room.freeWashers),
                    dryer: String(room.freeDryers),
                  })}
                  onClick={() => onSelect(room.location)}
                  className={cn(
                    'relative flex flex-col items-start gap-4 rounded-[20px] p-4 pb-[15px] text-left transition-transform active:scale-[0.97]',
                    room.selected ? 'bg-surface shadow-[inset_0_0_0_1.5px_#d5d7dc]' : 'bg-soft',
                  )}
                >
                  <b className="text-[17px] font-extrabold tracking-[-0.025em]">{room.label}</b>
                  <span className="flex gap-4">
                    <FreeCount type="washer" count={room.freeWashers} />
                    <FreeCount type="dryer" count={room.freeDryers} />
                  </span>
                  {room.selected && (
                    <span className="bg-ink absolute top-3.5 right-3.5 grid size-[22px] place-items-center rounded-full text-white">
                      <Check size={13} strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export namespace RoomSheet {
  export type Room = {
    location: string;
    label: string;
    freeWashers: number;
    freeDryers: number;
    selected: boolean;
  };

  export type Props = {
    open: boolean;
    rooms: Room[];
    onSelect: (location: string) => void;
    onClose: () => void;
  };
}
