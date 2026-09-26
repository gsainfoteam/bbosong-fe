import { MachineBox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MachineBox',
  component: MachineBox,
} satisfies Meta<typeof MachineBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    machine: {
      type: 'washer',
      id: 1,
      status: 'idle',
    },
    className: 'w-30',
  },
};

export const Using: Story = {
  args: {
    machine: { type: 'washer', id: 1, status: 'using' },
    className: 'w-30',
  },
};

export const Disabled: Story = {
  args: {
    machine: { type: 'washer', id: 1, status: 'disabled' },
    className: 'w-30',
  },
};

export const Dryer: Story = {
  args: {
    machine: { type: 'dryer', id: 2, status: 'idle' },
    className: 'w-30',
  },
};
