import { type MachineLocation, type MachineType } from './machine-view';

export type MapSpot = {
  type: MachineType;
  id: number;
  x: number;
  y: number;
};

export type LaundryRoomLayout = {
  spots: MapSpot[];
  door: { top: number; height: number };
  windows: { left: number; width: number }[];
};

const W = 350;
const H = 500;
const STEP = 46.4;

const column = (type: MachineType, ids: number[], x: number, firstY: number): MapSpot[] =>
  ids.map((id, i) => ({ type, id, x: x / W, y: (firstY + i * STEP) / H }));

// 서버에 아직 기기 좌표(posX · posY)가 없어 두 동에 같은 목업 배치를 쓴다.
const MOCK_SPOTS: MapSpot[] = [
  ...column('washer', [1, 2, 3, 4, 5, 6, 7, 8], 36, 36),
  ...column('dryer', [1, 2], 36, 417.2),
  ...column('dryer', [3, 4, 5, 6, 7, 8], 314, 232),
];

const MOCK_WINDOWS = [
  { left: 96 / W, width: 60 / W },
  { left: 194 / W, width: 60 / W },
];

const LAYOUTS: Record<MachineLocation, LaundryRoomLayout> = {
  a: { spots: MOCK_SPOTS, door: { top: 55 / H, height: 70 / H }, windows: MOCK_WINDOWS },
  b: { spots: MOCK_SPOTS, door: { top: 150 / H, height: 70 / H }, windows: MOCK_WINDOWS },
};

export function useFindMap(location: MachineLocation) {
  return { layout: LAYOUTS[location] };
}
