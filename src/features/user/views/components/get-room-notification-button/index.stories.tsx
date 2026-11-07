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

// 알림이 차단된 상태에서 버튼을 눌렀을 때 뜨는 모달을 바로 확인할 수 있도록 자동으로 연다
export const Denied: Story = {
  args: {
    ...Default.args,
    blocker: 'denied',
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'));
  },
};
