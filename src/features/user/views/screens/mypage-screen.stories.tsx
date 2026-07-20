import { MypageScreen } from './mypage-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MyPageScreen',
  component: MypageScreen,
} satisfies Meta<typeof MypageScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: '홍길동',
    usingMachineList: [
      {
        machine: { type: 'washer', id: 3 },
        location: 'a',
        onClear: () => console.log('Clear washer 3'),
      },
      {
        machine: { type: 'dryer', id: 1 },
        location: 'b',
        onClear: () => console.log('Clear dryer 1'),
      },
    ],
    roomStatusList: {
      aWasher: { count: 2, toggleState: false },
      aDryer: { count: 0, toggleState: true },
      bWasher: { count: 4, toggleState: false },
      bDryer: { count: 1, toggleState: true },
      onBoxClick: (building, machine) => {
        console.log(`Clicked ${building.toUpperCase()} - ${machine}`);
      },
    },
  },
};
