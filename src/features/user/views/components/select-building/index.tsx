import { useEffect, useId, useRef, useState } from 'react';

import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Sheet } from '@/common/components';
import { Button } from '@/common/components/ui/button';
import { cn } from '@/common/utils';

/**
 * 지금 보는 세탁실 이름. 누르면 아래 시트에서 세탁실을 바꾼다.
 * 시트의 각 세탁실에는 지금 비어 있는 세탁기·건조기 수가 함께 보인다.
 */
export function SelectBuilding({
  value,
  rooms,
  gender,
  onSelect,
  disabled = false,
  className,
  ...props
}: SelectBuilding.Props) {
  const { t } = useTranslation(['location', 'notification']);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    if (open && !sheet.open) sheet.showModal();
    if (!open && sheet.open) sheet.close();
  }, [open]);

  // t('location:a')
  // t('location:b')
  // t('location:laundryRoom')
  // t('notification:laundryRoom.male')
  // t('notification:laundryRoom.female')
  const genderLabel = gender
    ? t(gender === 'male' ? 'notification:laundryRoom.male' : 'notification:laundryRoom.female')
    : '';
  const roomName = (location: SelectBuilding.Location, withSuffix: boolean) =>
    [t(`location:${location}`), genderLabel, withSuffix && t('location:laundryRoom')]
      .filter(Boolean)
      .join(' ');

  const title = roomName(value, true);

  return (
    <div className={cn('flex h-7 items-center', className)} {...props}>
      <Button
        variant="text"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-label={`${t('location:change')}, ${title}`}
        onClick={() => setOpen(true)}
        className="text-title text-ink h-7 gap-0.5 px-0 font-extrabold"
      >
        {title}
        <ChevronDown size={22} className="text-ink3 mt-0.5" aria-hidden />
      </Button>

      <Sheet
        ref={sheetRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // 시트 바깥(배경)을 누르면 닫는다
          const rect = event.currentTarget.getBoundingClientRect();
          const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
          if (!inside) setOpen(false);
        }}
      >
        <h2 id={titleId} className="text-heading mb-6">
          {t('location:change')}
        </h2>
        <div role="radiogroup" aria-labelledby={titleId} className="grid grid-cols-2 gap-2.5">
          {rooms.map((room) => {
            const selected = room.value === value;

            return (
              <button
                key={room.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t('location:roomLabel', {
                  room: roomName(room.value, true),
                  washer: String(room.washerFree),
                  dryer: String(room.dryerFree),
                })}
                onClick={() => {
                  onSelect(room.value);
                  setOpen(false);
                }}
                className={cn(
                  'rounded-banner relative flex cursor-pointer flex-col items-start gap-4 px-4 pt-4 pb-3.75 text-left transition duration-120 active:scale-[0.97]',
                  selected ? 'bg-surface inset-ring-track inset-ring-[1.5px]' : 'bg-soft',
                )}
              >
                <b className="text-body-strong text-[17px]">{roomName(room.value, false)}</b>
                <span className="flex gap-4">
                  <Count shape="washer" count={room.washerFree} />
                  <Count shape="dryer" count={room.dryerFree} />
                </span>
                {selected && (
                  <span
                    aria-hidden
                    className="bg-ink text-surface absolute top-3.5 right-3.5 grid size-5.5 place-items-center rounded-full"
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}

/** 빈 기기 수. 세탁기는 원, 건조기는 둥근 사각 점으로 구분하고, 0이면 회색으로 눕힌다. */
function Count({ shape, count }: { shape: 'washer' | 'dryer'; count: number }) {
  return (
    <span
      className={cn('text-numeral inline-flex items-center gap-1.75', count === 0 && 'text-ink3')}
    >
      <i
        className={cn(
          'size-2.75 flex-none',
          shape === 'washer' ? 'rounded-full' : 'rounded-[3px]',
          count === 0 ? 'bg-track' : shape === 'washer' ? 'bg-sky-deep' : 'bg-orange-deep',
        )}
      />
      {count}
    </span>
  );
}

export namespace SelectBuilding {
  export type Location = 'a' | 'b';

  export type Room = {
    value: Location;
    /** 지금 비어 있는 세탁기·건조기 수 */
    washerFree: number;
    dryerFree: number;
  };

  export type Props = {
    value: Location;
    rooms: Room[];
    gender?: 'male' | 'female';
    onSelect: (location: Location) => void;
    disabled?: boolean;
    className?: string;
  };
}
