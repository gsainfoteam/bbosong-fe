import { type Meta, type StoryObj } from '@storybook/react-vite';

import { PowerRecordResults } from '.';

const meta = { title: 'Admin/PowerRecordResults', component: PowerRecordResults } satisfies Meta<
  typeof PowerRecordResults
>;
export default meta;
type Story = StoryObj<typeof meta>;
const recordedAt = (minutes: number) =>
  new Date(Date.UTC(2026, 9, 20, 6, minutes, 0)).toISOString();
export const Ready: Story = {
  args: {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    isLoading: false,
    isError: false,
    records: [0, 8, 16, 24, 32].map((minutes, index) => ({
      uuid: `record-${index}`,
      recordedAt: recordedAt(minutes),
      power: 180 + index * 240,
    })),
  },
};
export const Empty: Story = {
  args: {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    isLoading: false,
    isError: false,
    records: [],
  },
};
