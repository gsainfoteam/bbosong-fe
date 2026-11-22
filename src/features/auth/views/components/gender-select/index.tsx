import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/common/utils';
import { type Gender } from '@/features/auth';

const GENDERS = ['male', 'female'] as const satisfies NonNullable<Gender>[];

function Figure({ gender }: { gender: NonNullable<Gender> }) {
  return (
    <svg width={84} height={84} viewBox="0 0 84 84" aria-hidden className="block">
      {gender === 'male' ? (
        <g fill="#7ab0f2">
          <circle cx={42} cy={13} r={9} />
          <rect x={25} y={27} width={34} height={30} rx={9} />
          <rect x={31} y={48} width={9} height={34} rx={4.5} />
          <rect x={44} y={48} width={9} height={34} rx={4.5} />
        </g>
      ) : (
        <g fill="#f2949a">
          <circle cx={42} cy={13} r={9} />
          <path d="M42 27C48 27 52 29.5 54 35L63 62H21L30 35C32 29.5 36 27 42 27Z" />
          <rect x={32} y={58} width={8} height={24} rx={4} />
          <rect x={44} y={58} width={8} height={24} rx={4} />
        </g>
      )}
    </svg>
  );
}

export function GenderSelect({ onSelect, isError = false, className }: GenderSelect.Props) {
  const { t } = useTranslation('auth');
  const [selected, setSelected] = useState<NonNullable<Gender> | null>(null);

  const pending = isError ? null : selected;

  const label = {
    male: t('male'),
    female: t('female'),
  } satisfies Record<NonNullable<Gender>, string>;

  return (
    <div
      role="radiogroup"
      aria-label={t('gender.label')}
      aria-busy={pending !== null}
      className={cn('grid grid-cols-2 gap-2.5', className)}
    >
      {GENDERS.map((gender) => {
        const isPending = pending === gender;
        return (
          <button
            key={gender}
            type="button"
            role="radio"
            aria-checked={isPending}
            disabled={pending !== null}
            onClick={() => {
              setSelected(gender);
              onSelect(gender);
            }}
            className={cn(
              'flex h-47 flex-col items-center justify-center gap-4 rounded-3xl text-[18px] font-extrabold tracking-[-0.02em]',
              'transition-[background-color,color,opacity,transform] duration-200 active:scale-[0.97]',
              'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2',
              isPending ? 'bg-ink text-white' : 'bg-soft text-ink',
              pending !== null && !isPending && 'opacity-40',
            )}
          >
            <span className="grid size-21 place-items-center">
              {isPending ? (
                <Loader2 size={28} className="animate-spin" aria-hidden />
              ) : (
                <Figure gender={gender} />
              )}
            </span>
            {label[gender]}
          </button>
        );
      })}
    </div>
  );
}

export namespace GenderSelect {
  export type Props = {
    onSelect: (gender: NonNullable<Gender>) => void;
    isError?: boolean;
    className?: string;
  };
}
