import { useState } from 'react';

import { RoomStatusBox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/RoomStatusBox',
  component: RoomStatusBox,
} satisfies Meta<typeof RoomStatusBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    building: 'a',
    machine: 'washer',
    count: 8,
    toggleState: false,
    className: 'w-fit h-20',
  },
  render: (args) => {
    const [state, setState] = useState(args.toggleState);
    return (
      <RoomStatusBox
        building={args.building}
        machine={args.machine}
        count={args.count}
        toggleState={state}
        onChange={() => setState((prev) => !prev)}
        className={args.className}
      />
    );
  },
};