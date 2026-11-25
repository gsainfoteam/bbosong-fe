import { type MachineView } from '@/features/user/viewmodels';

import { MyLaundryCard } from '.';

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
  title: 'User/MyLaundryCard',
  component: MyLaundryCard,
  decorators: [
    (Story) => (
      <div className="bg-soft grid w-[390px] p-5">
        <Story />
      </div>
    ),
  ],
  args: { onUnregister: () => console.log('Unregister') },
} satisfies Meta<typeof MyLaundryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: {
    machine: machine('dryer', 5, 'running', { remainingMinutes: 63, level: 0.88, mine: true }),
  },
};

export const Solo: Story = {
  args: {
    solo: true,
    machine: machine('washer', 3, 'running', {
      remainingMinutes: 23,
      level: 0.38,
      mine: true,
      endsAt: Date.parse('2026-11-22T21:41:00+09:00'),
    }),
  },
};

export const Elapsed: Story = {
  args: { machine: machine('washer', 3, 'elapsed', { elapsedMinutes: 18, mine: true }) },
};

export const NotificationBlocked: Story = {
  args: {
    machine: machine('dryer', 5, 'running', { remainingMinutes: 12, level: 0.2, mine: true }),
    isNotificationEnabled: false,
    notificationBlocker: 'needs-install',
  },
};

export const WasherEnterTime: Story = {
  args: {
    solo: true,
    machine: machine('washer', 3, 'elapsed', { elapsedMinutes: 6, mine: true }),
    onSetRemainingTime: (minutes, onSuccess) => {
      console.log('Set remaining time', minutes);
      onSuccess();
    },
  },
};

export const WasherEditTime: Story = {
  args: {
    solo: true,
    machine: machine('washer', 3, 'running', {
      remainingMinutes: 31,
      level: 0.55,
      mine: true,
      endsAt: Date.parse('2026-11-22T21:41:00+09:00'),
    }),
    onSetRemainingTime: (minutes, onSuccess) => {
      console.log('Set remaining time', minutes);
      onSuccess();
    },
  },
};
