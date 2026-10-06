import { QrScanScreen } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof QrScanScreen> = {
  title: 'User/QrScanScreen',
  component: QrScanScreen,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QrScanScreen>;

export const Default: Story = {
  args: {},
};

export const CameraError: Story = {
  args: { isCameraError: true },
};
