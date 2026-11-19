import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  type DailySessionStatsRange,
  type UsageStatsDimension,
  type UsageStatsFilter,
} from '../../../viewmodels';

import { UsageStatsPanel } from '.';

const meta = {
  title: 'Admin/UsageStatsPanel',
  component: UsageStatsPanel,
} satisfies Meta<typeof UsageStatsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

const hourly = [8, 9, 12, 19, 21, 22, 23].map((hour, index) => ({
  hour,
  sessionCount: (index + 2) * 3,
}));

function Interactive(args: UsageStatsPanel.Props) {
  const [dimension, setDimension] = useState<UsageStatsDimension>(args.dimension);
  const [days, setDays] = useState<DailySessionStatsRange>(args.days);
  const [filter, setFilter] = useState<UsageStatsFilter>(args.filter);
  return (
    <UsageStatsPanel
      {...args}
      dimension={dimension}
      onDimensionChange={setDimension}
      days={days}
      onDaysChange={setDays}
      filter={filter}
      onFilterChange={setFilter}
    />
  );
}

const base = {
  dimension: 'hour',
  onDimensionChange: () => undefined,
  days: 7,
  onDaysChange: () => undefined,
  filter: {},
  onFilterChange: () => undefined,
} satisfies Partial<UsageStatsPanel.Props>;

export const Default: Story = {
  args: { ...base, data: hourly, isLoading: false, isError: false },
  render: (args) => <Interactive {...args} />,
};

export const Loading: Story = {
  args: { ...base, data: [], isLoading: true, isError: false },
};

export const ErrorState: Story = {
  args: { ...base, data: [], isLoading: false, isError: true },
};
