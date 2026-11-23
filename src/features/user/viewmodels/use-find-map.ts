import { type Gender } from '@/features/auth';

import { type MachineLocation, type MachineType } from './machine-view';

export type MapSpot = {
  type: MachineType;
  id: number;
  x: number;
  y: number;
};

export type LaundryRoomLayout = {
  spots: MapSpot[];
  door: { top: number; height: number; double?: boolean };
  windows: { left: number; width: number }[];
  // 지도 캔버스의 가로/세로 비율 (기본 350/500). 기기가 많은 방은 세로를 늘린다
  aspect?: number;
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

// 세탁실별 Figma 프레임(가로형) 기준 px 좌표.
// 지도 캔버스는 세로형이라 반시계 방향으로 90° 돌려 배치한다 (Figma 위 → 왼쪽, 아래 → 오른쪽).
const fromFigma = (frame: { w: number; h: number }) => ({
  spot: (type: MachineType, id: number, cx: number, cy: number): MapSpot => ({
    type,
    id,
    x: cy / frame.h,
    y: 1 - cx / frame.w,
  }),
  // 아래쪽 벽의 문(x 구간)이 회전 후 오른쪽 벽의 문이 된다
  door: (from: number, to: number, double = false) => ({
    top: 1 - to / frame.w,
    height: (to - from) / frame.w,
    double,
  }),
});

const B_MALE_FRAME = fromFigma({ w: 1352, h: 652 });

const B_MALE_SPOTS: MapSpot[] = [
  ...Array.from({ length: 8 }, (_, i) => B_MALE_FRAME.spot('washer', i + 1, 146 + i * 108, 102)),
  B_MALE_FRAME.spot('dryer', 9, 1008, 102),
  B_MALE_FRAME.spot('dryer', 10, 1112, 104),
  // 아랫줄은 번호가 오른쪽에서 왼쪽으로 커진다 (왼쪽부터 16→11번)
  ...Array.from({ length: 6 }, (_, i) => B_MALE_FRAME.spot('dryer', 11 + i, 1136 - i * 104, 552)),
];

const B_MALE_DOOR = B_MALE_FRAME.door(132, 332, true);

// A동 남자: 17대가 한 줄(40px 간격)에 세탁기·건조기가 섞여 있다. 세탁기는 1~9, 11, 14번
const A_MALE_FRAME = fromFigma({ w: 842, h: 376 });
const A_MALE_WASHERS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14]);
// 왼쪽부터의 번호 순서
const A_MALE_ORDER = [1, 2, 3, 4, 5, 6, 17, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

// 마커(40px)가 겹치지 않도록 세로를 늘린 캔버스(440×800)에 위아래 여백 6%로 고르게 편다
const A_MALE_ASPECT = 440 / 800;
const A_MALE_SPOTS: MapSpot[] = A_MALE_ORDER.map((id, i) => ({
  ...A_MALE_FRAME.spot(A_MALE_WASHERS.has(id) ? 'washer' : 'dryer', id, 0, 0),
  x: 0.12, // 왼쪽 벽에 붙여 배치
  y: 0.94 - (i * 0.88) / (A_MALE_ORDER.length - 1),
}));

const A_MALE_DOOR = A_MALE_FRAME.door(66, 166, true);

// A동 여자: 세탁기는 1·2·5·6·7·8번, 건조기는 3·4·9·10번 (프레임 676×376)
const A_FEMALE_FRAME = fromFigma({ w: 676, h: 376 });

const A_FEMALE_SPOTS: MapSpot[] = [
  A_FEMALE_FRAME.spot('washer', 1, 229, 93),
  A_FEMALE_FRAME.spot('washer', 2, 283, 93),
  A_FEMALE_FRAME.spot('dryer', 3, 336, 93),
  A_FEMALE_FRAME.spot('dryer', 4, 388, 93),
  A_FEMALE_FRAME.spot('washer', 5, 441, 93),
  A_FEMALE_FRAME.spot('washer', 6, 495, 93),
  A_FEMALE_FRAME.spot('washer', 7, 549, 93),
  A_FEMALE_FRAME.spot('washer', 8, 603, 93),
  A_FEMALE_FRAME.spot('dryer', 9, 70, 188),
  A_FEMALE_FRAME.spot('dryer', 10, 70, 240),
];

const A_FEMALE_DOOR = A_FEMALE_FRAME.door(66, 166, true);

// B동 여자: 세탁기 1~9번, 건조기 10~14번 (프레임 1352×652, B동 남자와 같은 크기)
const B_FEMALE_SPOTS: MapSpot[] = [
  ...Array.from({ length: 9 }, (_, i) => B_MALE_FRAME.spot('washer', i + 1, 146 + i * 108, 102)),
  B_MALE_FRAME.spot('dryer', 10, 1116, 104),
  // 오른쪽 벽을 따라 11~14번이 위에서 아래로 놓인다
  ...Array.from({ length: 4 }, (_, i) => B_MALE_FRAME.spot('dryer', 11 + i, 1248, 216 + i * 104)),
];

const LAYOUTS: Record<MachineLocation, LaundryRoomLayout> = {
  a: { spots: MOCK_SPOTS, door: { top: 55 / H, height: 70 / H }, windows: MOCK_WINDOWS },
  b: { spots: MOCK_SPOTS, door: { top: 400 / H, height: 70 / H }, windows: MOCK_WINDOWS },
};

const ROOM_OVERRIDES: Partial<Record<`${MachineLocation}-${Gender}`, Partial<LaundryRoomLayout>>> =
  {
    'a-male': { spots: A_MALE_SPOTS, door: A_MALE_DOOR, aspect: A_MALE_ASPECT },
    'a-female': { spots: A_FEMALE_SPOTS, door: A_FEMALE_DOOR },
    'b-female': { spots: B_FEMALE_SPOTS, door: B_MALE_DOOR },
    'b-male': { spots: B_MALE_SPOTS, door: B_MALE_DOOR },
  };

export function useFindMap(location: MachineLocation, gender?: Gender) {
  const override = gender ? ROOM_OVERRIDES[`${location}-${gender}`] : undefined;
  return { layout: { ...LAYOUTS[location], ...override } };
}
