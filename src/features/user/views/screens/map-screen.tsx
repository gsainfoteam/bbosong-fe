import { pick } from 'es-toolkit';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TopBar } from '@/common/components';
import { cn } from '@/common/utils';
import { MapMarker, useMachineText } from '@/features/user';
import { type LaundryRoomLayout, type MachineView } from '@/features/user/viewmodels';

const pct = (ratio: number) => `${ratio * 100}%`;

function Legend() {
  const { t } = useTranslation(['main', 'machine']);
  const items: { label: string; marker: MapMarker.Props }[] = [
    { label: t('machine:washer'), marker: { type: 'washer', state: 'idle' } },
    { label: t('machine:dryer'), marker: { type: 'dryer', state: 'idle' } },
    { label: t('map.running'), marker: { type: 'washer', state: 'running', level: 0.55 } },
    { label: t('machine:off'), marker: { type: 'washer', state: 'off' } },
    {
      label: t('machine:aria.mine'),
      marker: { type: 'washer', state: 'running', level: 1, mine: true },
    },
  ];

  return (
    <ul
      aria-hidden
      className="text-ink-2 mt-3.5 flex flex-wrap gap-x-3.5 gap-y-2 px-1 text-[12.5px]"
    >
      {items.map(({ label, marker }) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <MapMarker size="s" {...marker} />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function MapScreen({ room, layout, spots, onBack, className }: MapScreen.Props) {
  const { door, windows } = layout;
  const { t } = useTranslation('main');
  const text = useMachineText();
  const mine = spots.filter(({ machine }) => machine.mine).map(({ machine }) => machine);

  const remaining = (machine: MachineView) =>
    machine.state === 'running' || machine.state === 'paused'
      ? text.duration(machine.remainingMinutes ?? 0)
      : text.label(machine);

  return (
    <div className={cn('bg-surface flex min-h-dvh w-full flex-1 flex-col', className)}>
      <TopBar title={t('map.title')} onBack={onBack} />
      <div className="pb-cta px-5">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={t('roomCurrent', { room: room.title })}
          onClick={room.onOpen}
          className="mt-0.5 flex h-[26px] items-center gap-0.5 text-[21px] font-extrabold tracking-[-0.03em]"
        >
          {room.title}
          <ChevronDown size={20} className="text-ink-3 mt-[3px]" aria-hidden />
        </button>
        {mine.length > 0 && (
          <p className="text-ink-2 mt-2 text-[13.5px]">
            {t('map.mine', { machines: mine.map(text.name).join(', ') })}
          </p>
        )}

        <div
          role="list"
          aria-label={t('map.label', { room: room.title })}
          className="bg-soft rounded-card relative mt-4.5 aspect-[350/500] w-full bg-[linear-gradient(rgb(27_29_33/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(27_29_33/0.045)_1px,transparent_1px)] bg-size-[25px_25px] shadow-[inset_0_0_0_6px_#dadce0]"
        >
          {windows.map((window) => (
            <span
              key={window.left}
              aria-hidden
              className="bg-sky-water absolute top-0 h-1.5 rounded-b-[3px]"
              style={{ left: pct(window.left), width: pct(window.width) }}
            />
          ))}
          <span
            aria-hidden
            className="absolute right-[-2px] w-2.5 rounded-[3px] bg-white shadow-[0_0_0_1.5px_var(--color-track)]"
            style={{ top: pct(door.top), height: pct(door.height) }}
          />
          <span
            className="border-off-rim absolute right-2 aspect-square rounded-bl-full border-b-[1.4px] border-l-[1.4px] border-dashed"
            style={{ top: pct(door.top), height: pct(door.height) }}
          >
            <span className="text-ink-3 absolute top-3/4 right-full mr-1.5 -translate-y-1/2 text-[12px] font-bold whitespace-nowrap">
              {t('map.door')}
            </span>
          </span>

          {spots.map(({ machine, x, y }) => (
            <MapMarker
              key={machine.uuid}
              role="listitem"
              aria-label={text.aria(machine)}
              {...pick(machine, ['type', 'state', 'id', 'level', 'mine'])}
              className="absolute -translate-1/2"
              style={{ left: pct(x), top: pct(y) }}
            />
          ))}

          {spots
            .filter(({ machine }) => machine.mine)
            .map(({ machine, x, y }) => (
              <span
                key={`${machine.uuid}-callout`}
                aria-hidden
                className="bg-ink absolute flex h-[26px] -translate-y-1/2 items-center rounded-full px-2.5 text-[12px] font-bold whitespace-nowrap text-white"
                style={
                  x < 0.5
                    ? { top: pct(y), left: `calc(${pct(x)} + 32px)` }
                    : { top: pct(y), right: `calc(${pct(1 - x)} + 32px)` }
                }
              >
                {t('map.callout', { time: remaining(machine) })}
              </span>
            ))}
        </div>

        <Legend />
      </div>
    </div>
  );
}

export namespace MapScreen {
  export type Spot = { machine: MachineView; x: number; y: number };

  export type Props = {
    room: { title: string; onOpen: () => void };
    spots: Spot[];
    layout: Pick<LaundryRoomLayout, 'door' | 'windows'>;
    onBack: () => void;
    className?: string;
  };
}
