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
    userName: '홍길동',
    machineList: [
      {
        machine: { type: 'washer', id: 2 },
        location: 'a',
        onClear: () => console.log('Clear machine 2 in building A'),
      },
      {
        machine: { type: 'dryer', id: 5 },
        location: 'b',
        onClear: () => console.log('Clear dryer 5 in building B'),
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    userName: '홍길동',
    machineList: [],
  },
};
