import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Gender, Location, MachineType } from '../../../viewmodels';

import { MachineTable } from '.';

const meta = { title: 'Admin/MachineTable', component: MachineTable } satisfies Meta<
  typeof MachineTable
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    showLinks: true,
    machines: [
      {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        type: MachineType.WASHER,
        location: Location.A,
        gender: Gender.MALE,
        index: 2,
        isAvailable: true,
        isOnline: true,
        status: 'IDLE' as MachineTable.Props['machines'][number]['status'],
        posX: null,
        posY: null,
        shortUrl: null,
        shortCode: null,
      },
    ],
  },
};
export const Empty: Story = { args: { machines: [], showTiming: true } };
export const Timing: Story = {
  args: {
    showTiming: true,
    machines: [
      {
        ...Default.args.machines[0],
        status: 'WASH' as MachineTable.Props['machines'][number]['status'],
        lastSeenAt: new Date(Date.now() - 3 * 60_000).toISOString(),
        currentUsage: { startedAt: new Date(Date.now() - 90 * 60_000).toISOString() },
      },
      { ...Default.args.machines[0], uuid: 'missing-timing', index: 3 },
    ],
  },
};
