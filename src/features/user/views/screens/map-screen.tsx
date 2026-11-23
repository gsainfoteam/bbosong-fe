import { useEffect, useRef, useState } from 'react';

import { pick } from 'es-toolkit';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TopBar } from '@/common/components';
import { cn } from '@/common/utils';
import { MapMarker, useMachineText } from '@/features/user';
import { type LaundryRoomLayout, type MachineView } from '@/features/user/viewmodels';

const pct = (ratio: number) => `${ratio * 100}%`;

type Rect = { left: number; top: number; width: number; height: number };

const MARKER = 40;
const CALLOUT_HEIGHT = 26;
const CALLOUT_GAP = 12;
const EDGE = 6;

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height;

// 글자 폭을 대략 추정한다 (한글 12px, 그 외 7px, 좌우 패딩 20px)
const estimateWidth = (label: string) =>
  [...label].reduce((sum, char) => sum + (char.charCodeAt(0) > 0x7f ? 12 : 7), 20);

// 말풍선을 옆(기본) → 반대쪽 → 아래 → 위 순서로 시도해, 다른 마커나 지도 밖과 겹치지 않는 첫 위치를 고른다
function placeCallout(
  center: { x: number; y: number },
  width: number,
  others: { x: number; y: number }[],
  canvas: { width: number; height: number },
): Rect {
  const { x, y } = center;
  const side = (dir: 1 | -1): Rect => ({
    left: dir === 1 ? x + MARKER / 2 + CALLOUT_GAP : x - MARKER / 2 - CALLOUT_GAP - width,
    top: y - CALLOUT_HEIGHT / 2,
    width,
    height: CALLOUT_HEIGHT,
  });
  const vertical = (dir: 1 | -1): Rect => ({
    left: x - width / 2,
    top: dir === 1 ? y + MARKER / 2 + CALLOUT_GAP : y - MARKER / 2 - CALLOUT_GAP - CALLOUT_HEIGHT,
    width,
    height: CALLOUT_HEIGHT,
  });

  const preferred = x < canvas.width / 2 ? 1 : -1;
  const candidates = [side(preferred), side(preferred === 1 ? -1 : 1), vertical(1), vertical(-1)];
  const obstacles = others.map((other) => ({
    left: other.x - MARKER / 2 - 3,
    top: other.y - MARKER / 2 - 3,
    width: MARKER + 6,
    height: MARKER + 6,
  }));

  const fits = (rect: Rect) =>
    rect.left >= EDGE &&
    rect.top >= EDGE &&
    rect.left + rect.width <= canvas.width - EDGE &&
    rect.top + rect.height <= canvas.height - EDGE &&
    obstacles.every((obstacle) => !overlaps(rect, obstacle));

  return candidates.find(fits) ?? candidates[0];
}

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
  const { door, windows, aspect = 350 / 500 } = layout;
  const { t } = useTranslation('main');
  const text = useMachineText();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(440);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => setCanvasWidth(entry.contentRect.width));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const canvas = { width: canvasWidth, height: canvasWidth / aspect };

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
          ref={canvasRef}
          role="list"
          aria-label={t('map.label', { room: room.title })}
          style={{ aspectRatio: aspect }}
          className="bg-soft rounded-card relative mt-4.5 w-full bg-[linear-gradient(rgb(27_29_33/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(27_29_33/0.045)_1px,transparent_1px)] bg-size-[25px_25px] shadow-[inset_0_0_0_6px_#dadce0]"
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
            style={{ top: pct(door.top), height: pct(door.double ? door.height / 2 : door.height) }}
          >
            <span className="text-ink-3 absolute top-3/4 right-full mr-1.5 -translate-y-1/2 text-[12px] font-bold whitespace-nowrap">
              {t('map.door')}
            </span>
          </span>
          {door.double && (
            <span
              aria-hidden
              className="border-off-rim absolute right-2 aspect-square rounded-tl-full border-t-[1.4px] border-l-[1.4px] border-dashed"
              style={{ top: pct(door.top + door.height / 2), height: pct(door.height / 2) }}
            />
          )}

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
            .map(({ machine, x, y }) => {
              const label = t('map.callout', { time: remaining(machine) });
              const others = spots
                .filter((spot) => spot.machine.uuid !== machine.uuid)
                .map((spot) => ({ x: spot.x * canvas.width, y: spot.y * canvas.height }));
              const rect = placeCallout(
                { x: x * canvas.width, y: y * canvas.height },
                estimateWidth(label),
                others,
                canvas,
              );

              return (
                <span
                  key={`${machine.uuid}-callout`}
                  aria-hidden
                  className="bg-ink absolute flex h-[26px] items-center rounded-full px-2.5 text-[12px] font-bold whitespace-nowrap text-white"
                  style={{ left: rect.left, top: rect.top }}
                >
                  {label}
                </span>
              );
            })}
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
    layout: Pick<LaundryRoomLayout, 'door' | 'windows' | 'aspect'>;
    onBack: () => void;
    className?: string;
  };
}
