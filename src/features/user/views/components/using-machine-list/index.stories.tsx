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
        state: {
          status: 'using',
          elapsedMinutes: 17,
          remainingDisplay: { kind: 'minutes', minutes: 23 },
        },
        onUnregister: () => console.log('Unregister'),
      },
      {
        machine: { type: 'dryer', id: 5 },
        location: 'b',
        notification: false,
        state: {
          status: 'using',
          elapsedMinutes: 9,
          remainingDisplay: { kind: 'minutes', minutes: 63 },
        },
        onUnregister: () => console.log('Unregister'),
      },
    ],
    isNotificationEnabled: true,
  },
};

/** 한 대면 한 줄로 넓게 놓는다. */
export const One: Story = {
  args: {
    machineList: [
      {
        machine: { type: 'washer', id: 2 },
        location: 'a',
        notification: true,
        state: {
          status: 'using',
          elapsedMinutes: 17,
          remainingDisplay: { kind: 'minutes', minutes: 23 },
        },
        onUnregister: () => console.log('Unregister'),
      },
    ],
    isNotificationEnabled: true,
  },
};

/** 내 빨래가 없으면 자리를 접는다. */
export const Empty: Story = {
  args: {
    machineList: [],
    isNotificationEnabled: true,
  },
};
