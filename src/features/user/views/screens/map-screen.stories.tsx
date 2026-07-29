import { type Meta, type StoryObj } from '@storybook/react-vite';

import { type Machine, MapScreen } from '@/features/user';

const meta = {
  title: 'Map/MapScreen',
  component: MapScreen,
} satisfies Meta<typeof MapScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

// 기기들의 도면 좌표 및 세탁/건조 타입 정의 (id는 숫자, type은 대문자, name 삭제)
const mockDevices: Machine[] = [
  // 상단 좌측 세탁기 (1~8번, 사각형)
  { id: 1, type: 'WASHER', x: 85, y: 75 },
  { id: 2, type: 'WASHER', x: 140, y: 75 },
  { id: 3, type: 'WASHER', x: 195, y: 75 },
  { id: 4, type: 'WASHER', x: 250, y: 75 },
  { id: 5, type: 'WASHER', x: 305, y: 75 },
  { id: 6, type: 'WASHER', x: 360, y: 75 },
  { id: 7, type: 'WASHER', x: 415, y: 75 },
  { id: 8, type: 'WASHER', x: 470, y: 75 },

  // 상단 우측 건조기 (1~2번, 원형)
  { id: 1, type: 'DRYER', x: 540, y: 75 },
  { id: 2, type: 'DRYER', x: 595, y: 75 },

  // 하단 우측 건조기 (3~8번, 원형)
  { id: 3, type: 'DRYER', x: 380, y: 320 },
  { id: 4, type: 'DRYER', x: 435, y: 320 },
  { id: 5, type: 'DRYER', x: 490, y: 320 },
  { id: 6, type: 'DRYER', x: 545, y: 320 },
  { id: 7, type: 'DRYER', x: 600, y: 320 },
  { id: 8, type: 'DRYER', x: 655, y: 320 },
];

export const Default: Story = {
  args: {
    laundryRoomLayouts: [
      {
        label: 'location.a',
        machines: mockDevices,
        doorX: 150,
      },
      {
        label: 'location.b',
        machines: mockDevices,
        doorX: 400,
      },
    ],
  },
};
