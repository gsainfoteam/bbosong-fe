import { GetRoomNotificationButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/GetRoomNotificationButton',
  component: GetRoomNotificationButton,
} satisfies Meta<typeof GetRoomNotificationButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    machineType: 'washer',
    active: false,
    onToggle: () => console.log('Toggle'),
  },
};

export const Active: Story = {
  args: {
    ...Default.args,
    active: true,
  },
};

export const Pending: Story = {
  args: {
    ...Default.args,
    isPending: true,
  },
};

export const NeedsPermission: Story = {
  args: {
    ...Default.args,
    blocker: 'needs-permission',
  },
};
