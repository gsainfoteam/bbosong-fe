import { MachineRegisterScreen } from './machine-register-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MachineRegisterScreen',
  component: MachineRegisterScreen,
} satisfies Meta<typeof MachineRegisterScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    machine: { type: 'washer', id: 1 },
    location: 'a',
    onRegister: () => console.log('Register Clicked'),
  },
};
