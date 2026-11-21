import { type MachineView } from '@/features/user/viewmodels';

import { MainScreen } from './main-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const machine = (
  type: MachineView['type'],
  id: number,
  state: MachineView['state'],
  extra: Partial<MachineView> = {},
): MachineView => ({
  uuid: `${type}-${id}`,
  type,
  location: 'a',
  gender: 'male',
  id,
  state,
  phase: type === 'washer' ? 'washing' : 'drying',
  level: 0,
  mine: false,
  ...extra,
});

const myWasher = machine('washer', 3, 'running', {
  remainingMinutes: 23,
  level: 0.38,
  mine: true,
  endsAt: Date.parse('2026-11-22T21:41:00+09:00'),
});
const myDryer = machine('dryer', 5, 'running', {
  remainingMinutes: 63,
  level: 0.88,
  mine: true,
  endsAt: Date.parse('2026-11-22T22:21:00+09:00'),
});

const washers = [
  machine('washer', 1, 'running', { remainingMinutes: 41, level: 0.7 }),
  machine('washer', 2, 'idle'),
  myWasher,
  machine('washer', 4, 'detecting'),
  machine('washer', 5, 'idle'),
  machine('washer', 6, 'off'),
  machine('washer', 7, 'elapsed', { elapsedMinutes: 72 }),
  machine('washer', 8, 'running', { remainingMinutes: 8, level: 0.12 }),
];

const dryers = [
  machine('dryer', 1, 'running', { remainingMinutes: 52, level: 0.74 }),
  machine('dryer', 2, 'paused', { remainingMinutes: 34, level: 0.5 }),
  machine('dryer', 3, 'detecting'),
  machine('dryer', 4, 'running', { remainingMinutes: 5, level: 0.07 }),
  myDryer,
  machine('dryer', 6, 'running', { remainingMinutes: 20, level: 0.3 }),
  machine('dryer', 7, 'running', { remainingMinutes: 41, level: 0.6 }),
  machine('dryer', 8, 'off'),
];

const unregister = () => console.log('Unregister');

const meta = {
  title: 'User/MainScreen',
  component: MainScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    header: {
      onRefresh: () => console.log('Refresh'),
      onRegister: () => console.log('Register'),
    },
    myLaundry: {
      items: [
        { machine: myWasher, onUnregister: unregister },
        { machine: myDryer, onUnregister: unregister },
      ],
      isNotificationEnabled: true,
    },
    room: { title: 'A동 남자 세탁실', onOpen: () => console.log('Open room sheet') },
    washers,
    dryers,
    roomNotification: {
      washer: {
        machineType: 'washer',
        active: false,
        onToggle: () => console.log('Toggle washer'),
      },
      dryer: { machineType: 'dryer', active: false, onToggle: () => console.log('Toggle dryer') },
    },
  },
} satisfies Meta<typeof MainScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneMachine: Story = {
  args: {
    myLaundry: {
      items: [{ machine: myWasher, onUnregister: unregister }],
      isNotificationEnabled: true,
    },
  },
};

export const NoMachine: Story = {
  args: { myLaundry: { items: [], isNotificationEnabled: true } },
};
