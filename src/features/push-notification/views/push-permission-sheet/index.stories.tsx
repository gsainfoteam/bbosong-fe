import { MachineVessel } from '@/features/user';

import { PushPermissionSheet } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const prompt: PushPermissionSheet.Props['prompt'] = {
  status: 'default',
  permission: 'default',
  isNative: false,
  isRequesting: false,
  requestPermission: async () => console.log('Request permission'),
  install: {
    canPrompt: false,
    isPrompting: false,
    promptInstall: async () => console.log('Prompt install'),
    showManualGuide: false,
    isIOS: false,
    isAndroid: false,
  },
};

const meta = {
  title: 'PushNotification/PushPermissionSheet',
  component: PushPermissionSheet,
  args: {
    open: true,
    onClose: () => console.log('Close'),
    prompt,
    art: <MachineVessel type="washer" id={3} state="running" level={0.72} mine size={72} />,
  },
} satisfies Meta<typeof PushPermissionSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AfterRegister: Story = {};

export const Requesting: Story = {
  args: { prompt: { ...prompt, isRequesting: true } },
};

export const AfterInstall: Story = {
  args: { art: undefined, afterInstall: true },
};

export const NeedsInstall: Story = {
  args: {
    prompt: { ...prompt, status: 'needs-install', install: { ...prompt.install, canPrompt: true } },
  },
};

export const NeedsInstallIOS: Story = {
  args: {
    prompt: { ...prompt, status: 'needs-install', install: { ...prompt.install, isIOS: true } },
  },
};

export const Denied: Story = {
  args: { prompt: { ...prompt, status: 'denied' } },
};
