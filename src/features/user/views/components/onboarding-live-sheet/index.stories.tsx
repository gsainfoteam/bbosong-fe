import { OnboardingLiveSheet } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/OnboardingLiveSheet',
  component: OnboardingLiveSheet,
  parameters: { layout: 'fullscreen' },
  args: {
    permission: 'default',
    liveActivitySupported: true,
    isNative: true,
    isRequesting: false,
    position: 4,
    total: 4,
    onEnable: () => console.log('Enable'),
    onClose: () => console.log('Close'),
  },
} satisfies Meta<typeof OnboardingLiveSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Granted: Story = { args: { permission: 'granted' } };

export const Denied: Story = { args: { permission: 'denied' } };

export const Requesting: Story = { args: { isRequesting: true } };

export const LiveActivityUnsupported: Story = { args: { liveActivitySupported: false } };
