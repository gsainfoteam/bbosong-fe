import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/common/components';
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

  return (
    <BottomSheet open={open} onClose={onClose} title={t('switchRoom')}>
      <div role="radiogroup" aria-label={t('switchRoom')} className="grid grid-cols-2 gap-2.5">
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
    </BottomSheet>
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
