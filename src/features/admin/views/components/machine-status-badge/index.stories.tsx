import { type Meta, type StoryObj } from '@storybook/react-vite';

import { MachineStatusBadge } from '.';

const meta = {
  title: 'Admin/MachineStatusBadge',
  component: MachineStatusBadge,
} satisfies Meta<typeof MachineStatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Idle: Story = { args: { isAvailable: true, status: 'IDLE' } };
export const Washing: Story = { args: { isAvailable: true, status: 'WASH' } };
export const Unavailable: Story = { args: { isAvailable: false, status: 'WASH' } };
