import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import { type DailySessionStatsRange } from '../../../viewmodels';

import { DailyRoomSubscriptionStatsPanel } from '.';

const meta = {
  title: 'Admin/DailyRoomSubscriptionStatsPanel',
  component: DailyRoomSubscriptionStatsPanel,
} satisfies Meta<typeof DailyRoomSubscriptionStatsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

const series = [
  {
    date: '2026-11-06',
    subscriptionCount: 6,
    subscriptionUserCount: 4,
    notificationCount: 5,
    notificationUserCount: 3,
  },
  {
    date: '2026-11-07',
    subscriptionCount: 9,
    subscriptionUserCount: 6,
    notificationCount: 8,
    notificationUserCount: 6,
  },
  {
    date: '2026-11-08',
    subscriptionCount: 0,
    subscriptionUserCount: 0,
    notificationCount: 0,
    notificationUserCount: 0,
  },
  {
    date: '2026-11-09',
    subscriptionCount: 12,
    subscriptionUserCount: 7,
    notificationCount: 10,
    notificationUserCount: 7,
  },
];

function Interactive(args: DailyRoomSubscriptionStatsPanel.Props) {
  const [days, setDays] = useState<DailySessionStatsRange>(args.days);
  return <DailyRoomSubscriptionStatsPanel {...args} days={days} onDaysChange={setDays} />;
}

export const Default: Story = {
  args: {
    days: 7,
    onDaysChange: () => undefined,
    data: series,
    isLoading: false,
    isError: false,
  },
  render: (args) => <Interactive {...args} />,
};

export const Loading: Story = {
  args: {
    days: 7,
    onDaysChange: () => undefined,
    data: [],
    isLoading: true,
    isError: false,
  },
};

export const ErrorState: Story = {
  args: {
    days: 7,
    onDaysChange: () => undefined,
    data: [],
    isLoading: false,
    isError: true,
  },
};
