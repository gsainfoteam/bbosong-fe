import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import { RoomStatusGrid } from './index';

const meta = {
  title: 'User/RoomStatusGrid',
  component: RoomStatusGrid,
} satisfies Meta<typeof RoomStatusGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    aWasher: { count: 3, toggleState: false },
    aDryer: { count: 1, toggleState: true },
    bWasher: { count: 0, toggleState: false },
    bDryer: { count: 4, toggleState: true },
    onBoxClick: () => {},
  },
  render: (args) => {
    // 4가지 구역별 로컬 알림 활성화 상태(State) 선언
    const [aWasher, setAWasher] = useState(args.aWasher);
    const [aDryer, setADryer] = useState(args.aDryer);
    const [bWasher, setBWasher] = useState(args.bWasher);
    const [bDryer, setBDryer] = useState(args.bDryer);

    const handleBoxClick = (building: 'a' | 'b', machine: 'washer' | 'dryer') => {
      console.log(`Clicked building ${building.toUpperCase()}, machine ${machine}`);

      // 상태 변경 분기 제어
      if (building === 'a') {
        if (machine === 'washer') {
          setAWasher((prev) => ({ ...prev, toggleState: !prev.toggleState }));
        } else {
          setADryer((prev) => ({ ...prev, toggleState: !prev.toggleState }));
        }
      } else {
        if (machine === 'washer') {
          setBWasher((prev) => ({ ...prev, toggleState: !prev.toggleState }));
        } else {
          setBDryer((prev) => ({ ...prev, toggleState: !prev.toggleState }));
        }
      }
    };

    return (
      <RoomStatusGrid
        {...args}
        aWasher={aWasher}
        aDryer={aDryer}
        bWasher={bWasher}
        bDryer={bDryer}
        onBoxClick={handleBoxClick}
      />
    );
  },
};
