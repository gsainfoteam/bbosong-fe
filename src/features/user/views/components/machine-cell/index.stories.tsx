import { type MachineView } from '@/features/user/viewmodels';

import { MachineCell } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const machine = (
  type: MachineView['type'],
  id: number,
  state: MachineView['state'],
  extra: Partial<MachineView> = {},
): MachineView => ({
  uuid: `${type}-${id}`,
  type,
  location: 'a',
  gender: 'male',
  id,
  state,
  phase: type === 'washer' ? 'washing' : 'drying',
  level: 0,
  mine: false,
  ...extra,
});

const meta = {
  title: 'User/MachineCell',
  component: MachineCell,
} satisfies Meta<typeof MachineCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: { machine: machine('washer', 1, 'running', { remainingMinutes: 41, level: 0.7 }) },
};
export const Idle: Story = { args: { machine: machine('dryer', 2, 'idle') } };
export const Detecting: Story = { args: { machine: machine('dryer', 3, 'detecting') } };
export const Elapsed: Story = {
  args: { machine: machine('washer', 4, 'elapsed', { elapsedMinutes: 72 }) },
};
export const Paused: Story = {
  args: { machine: machine('dryer', 5, 'paused', { remainingMinutes: 34, level: 0.5 }) },
};
export const Off: Story = { args: { machine: machine('washer', 6, 'off') } };
export const Mine: Story = {
  args: {
    machine: machine('washer', 7, 'running', { remainingMinutes: 23, level: 0.38, mine: true }),
  },
};
