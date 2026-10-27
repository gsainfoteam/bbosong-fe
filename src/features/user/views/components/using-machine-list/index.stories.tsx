import { UsingMachineList } from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/UsingMachineList',
  component: UsingMachineList,
} satisfies Meta<typeof UsingMachineList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    machineList: [
      {
        machine: { type: 'washer', id: 2 },
        location: 'a',
        notification: true,
        onUnregister: () => console.log('Unregister'),
      },
      {
        machine: { type: 'dryer', id: 5 },
        location: 'b',
        notification: false,
        onUnregister: () => console.log('Unregister'),
      },
    ],
    isNotificationEnabled: true,
    onAdd: () => console.log('add'),
  },
};

export const Empty: Story = {
  args: {
    machineList: [],
    isNotificationEnabled: true,
    onAdd: () => console.log('add'),
  },
};
