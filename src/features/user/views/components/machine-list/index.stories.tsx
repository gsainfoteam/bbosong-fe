import { type MachineView } from '@/features/user/viewmodels';

import { MachineList } from '.';

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
  title: 'User/MachineList',
  component: MachineList,
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MachineList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Washers: Story = {
  args: {
    machines: [
      machine('washer', 1, 'running', { remainingMinutes: 41, level: 0.7 }),
      machine('washer', 2, 'idle'),
      machine('washer', 3, 'running', { remainingMinutes: 23, level: 0.38, mine: true }),
      machine('washer', 4, 'detecting'),
      machine('washer', 5, 'paused', { remainingMinutes: 31, level: 0.45 }),
      machine('washer', 6, 'off'),
      machine('washer', 7, 'elapsed', { elapsedMinutes: 72 }),
      machine('washer', 8, 'running', { remainingMinutes: 8, level: 0.12 }),
    ],
  },
};

export const Dryers: Story = {
  args: {
    machines: [
      machine('dryer', 1, 'running', { remainingMinutes: 52, level: 0.74 }),
      machine('dryer', 2, 'idle'),
      machine('dryer', 3, 'running', { remainingMinutes: 27, level: 0.42, mine: true }),
      machine('dryer', 4, 'detecting'),
      machine('dryer', 5, 'paused', { remainingMinutes: 34, level: 0.5 }),
      machine('dryer', 6, 'off'),
      machine('dryer', 7, 'elapsed', { elapsedMinutes: 38 }),
      machine('dryer', 8, 'running', { remainingMinutes: 6, level: 0.09, phase: 'cooling' }),
    ],
  },
};
