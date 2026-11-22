import { QrScanScreen } from './qr-scan-screen';
import { PHONE } from './story-fixtures';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/Screens/QrScan',
  component: QrScanScreen,
  parameters: { layout: 'fullscreen' },
  globals: PHONE,
  args: { videoRef: null, onClose: () => console.log('Close') },
} satisfies Meta<typeof QrScanScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scanning: Story = {};

export const CameraError: Story = {
  args: { isCameraError: true },
};
