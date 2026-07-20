import { RoomStatusGrid } from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
    onBoxClick: (building, machine) => {
      console.log(`Clicked building ${building.toUpperCase()}, machine ${machine}`);
    },
  },
};
