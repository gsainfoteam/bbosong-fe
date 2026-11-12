import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import { type DailySessionStatsRange } from '../../../viewmodels';

import { DailySessionStatsPanel } from '.';

const meta = {
  title: 'Admin/DailySessionStatsPanel',
  component: DailySessionStatsPanel,
} satisfies Meta<typeof DailySessionStatsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

const series = [
  { date: '2026-11-06', registeredCount: 3, unregisteredCount: 8 },
  { date: '2026-11-07', registeredCount: 5, unregisteredCount: 4 },
  { date: '2026-11-08', registeredCount: 0, unregisteredCount: 0 },
  { date: '2026-11-09', registeredCount: 7, unregisteredCount: 2 },
  { date: '2026-11-10', registeredCount: 4, unregisteredCount: 6 },
  { date: '2026-11-11', registeredCount: 9, unregisteredCount: 1 },
  { date: '2026-11-12', registeredCount: 2, unregisteredCount: 5 },
];

function Interactive(args: DailySessionStatsPanel.Props) {
  const [days, setDays] = useState<DailySessionStatsRange>(args.days);
  return <DailySessionStatsPanel {...args} days={days} onDaysChange={setDays} />;
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
