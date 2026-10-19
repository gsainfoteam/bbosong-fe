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
        index: 1,
        isAvailable: true,
        status: 'IDLE' as MachineTable.Props['machines'][number]['status'],
        posX: null,
        posY: null,
        shortUrl: null,
        shortCode: null,
      },
    ],
  },
};
export const Empty: Story = { args: { machines: [] } };
