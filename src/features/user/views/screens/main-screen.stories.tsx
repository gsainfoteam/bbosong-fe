import { MainScreen } from './main-screen';
import { dryers, myDryer, myWasher, PHONE, washers } from './story-fixtures';

import type { Meta, StoryObj } from '@storybook/react-vite';

const unregister = () => console.log('Unregister');
const setRemainingTime = (minutes: number, onSuccess: () => void) => {
  console.log('Set remaining time', minutes);
  onSuccess();
};

const meta = {
  title: 'User/Screens/Main',
  component: MainScreen,
  parameters: { layout: 'fullscreen' },
  globals: PHONE,
  args: {
    header: { onRefresh: () => console.log('Refresh') },
    onRegister: () => console.log('Register'),
    myLaundry: {
      items: [
        { machine: myWasher, onUnregister: unregister, onSetRemainingTime: setRemainingTime },
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
      items: [
        { machine: myWasher, onUnregister: unregister, onSetRemainingTime: setRemainingTime },
      ],
      isNotificationEnabled: true,
    },
  },
};

export const NoMachine: Story = {
  args: { myLaundry: { items: [], isNotificationEnabled: true } },
};

export const EmptyRoom: Story = {
  args: { myLaundry: { items: [], isNotificationEnabled: true }, washers: [], dryers: [] },
};
