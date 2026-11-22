import { MachineRegisterScreen } from './machine-register-screen';
import { dryers, machine, PHONE, washers } from './story-fixtures';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/Screens/MachineRegister',
  component: MachineRegisterScreen,
  parameters: { layout: 'fullscreen' },
  globals: PHONE,
  args: {
    machine: washers[0],
    roomTitle: 'A동 남자 세탁실',
    onRegister: () => console.log('Register'),
    onBack: () => console.log('Back'),
  },
} satisfies Meta<typeof MachineRegisterScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RunningWasher: Story = {};

export const PausedDryer: Story = {
  args: { machine: dryers[1] },
};

export const Idle: Story = {
  args: { machine: washers[1] },
};

export const Loading: Story = {
  args: { machine: { ...machine('washer', 3, 'idle'), state: 'loading' } },
};

export const Registering: Story = {
  args: { isPending: true },
};
