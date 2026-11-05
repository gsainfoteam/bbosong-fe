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
    machine: { type: 'washer', id: 1, status: 'using', elapsedMinutes: 90 },
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

export const DryerUsing: Story = {
  args: {
    machine: { type: 'dryer', id: 2, status: 'using', elapsedMinutes: 90 },
    className: 'w-30',
  },
};

export const DryerUsingRemaining: Story = {
  args: {
    machine: {
      type: 'dryer',
      id: 2,
      status: 'using',
      elapsedMinutes: 90,
      remainingDisplay: { kind: 'minutes', minutes: 75 },
    },
    className: 'w-30',
  },
};

export const DryerDetecting: Story = {
  args: {
    machine: {
      type: 'dryer',
      id: 2,
      status: 'using',
      elapsedMinutes: 5,
      remainingDisplay: { kind: 'detecting' },
    },
    className: 'w-30',
  },
};
