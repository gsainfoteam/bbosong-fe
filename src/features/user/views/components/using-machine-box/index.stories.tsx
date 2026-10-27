import { UsingMachineBox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/UsingMachineBox',
  component: UsingMachineBox,
} satisfies Meta<typeof UsingMachineBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    machine: {
      type: 'washer',
      id: 1,
    },
    location: 'a',
    notification: true,
    onUnregister: () => console.log('Unregister'),
    className: 'w-100',
  },
};

export const NotificationDisabled: Story = {
  args: {
    ...Default.args,
    isNotificationEnabled: false,
  },
};

export const NeedsInstall: Story = {
  args: {
    ...Default.args,
    isNotificationEnabled: false,
    notificationBlocker: 'needs-install',
  },
};

export const Unsupported: Story = {
  args: {
    ...Default.args,
    isNotificationEnabled: false,
    notificationBlocker: 'unsupported',
  },
};
