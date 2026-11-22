import { MainScreen } from './main-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MainScreen',
  component: MainScreen,
} satisfies Meta<typeof MainScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    header: { onRefresh: () => console.log('Refresh') },
    usingMachineList: {
      machineList: [
        {
          machine: { type: 'washer', id: 3 },
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
          machine: { type: 'dryer', id: 1 },
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
    selectBuilding: {
      value: 'a',
      gender: 'male',
      rooms: [
        { value: 'a', washerFree: 2, dryerFree: 1 },
        { value: 'b', washerFree: 0, dryerFree: 1 },
      ],
      onSelect: (location) => console.log(`Select ${location}`),
    },
    machines: {
      machines: [
        { type: 'washer', id: 1, status: 'idle' },
        { type: 'washer', id: 2, status: 'using', elapsedMinutes: 90 },
        { type: 'washer', id: 3, status: 'disabled' },
        { type: 'dryer', id: 1, status: 'idle' },
        { type: 'dryer', id: 2, status: 'using', elapsedMinutes: 90 },
        { type: 'dryer', id: 3, status: 'disabled' },
      ],
    },
    onRegister: () => console.log('Register'),
    roomNotification: {
      washer: {
        machineType: 'washer',
        active: false,
        onToggle: () => console.log('Toggle washer'),
      },
      dryer: { machineType: 'dryer', active: true, onToggle: () => console.log('Toggle dryer') },
    },
  },
  // 생활관 선택을 스토리 내부 상태로 관리해 실제 사용 흐름을 재현
};

export const NoUsingMachine: Story = {
  args: {
    ...Default.args,
    usingMachineList: {
      machineList: [],
      isNotificationEnabled: true,
    },
  },
};

export const NoIdleMachine: Story = {
  args: {
    ...Default.args,
    machines: {
      machines: [
        { type: 'washer', id: 1, status: 'using', elapsedMinutes: 90 },
        { type: 'washer', id: 2, status: 'disabled' },
        { type: 'dryer', id: 1, status: 'using', elapsedMinutes: 90 },
        { type: 'dryer', id: 2, status: 'disabled' },
      ],
    },
  },
};
