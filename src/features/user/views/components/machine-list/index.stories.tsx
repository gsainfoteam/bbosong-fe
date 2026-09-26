import { MachineList } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MachineList',
  component: MachineList,
} satisfies Meta<typeof MachineList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    machines: [
      { type: 'washer', id: 1, status: 'idle' },
      { type: 'washer', id: 2, status: 'using' },
      { type: 'washer', id: 3, status: 'disabled' },
      { type: 'dryer', id: 1, status: 'idle' },
      { type: 'dryer', id: 2, status: 'using' },
      { type: 'dryer', id: 3, status: 'disabled' },
    ],
    className: 'gap-4 w-100',
  },
};

export const WasherOnly: Story = {
  args: {
    machines: [
      { type: 'washer', id: 1, status: 'idle' },
      { type: 'washer', id: 2, status: 'idle' },
      { type: 'washer', id: 3, status: 'using' },
      { type: 'washer', id: 4, status: 'disabled' },
    ],
    className: 'gap-4 w-100',
  },
};

export const Empty: Story = {
  args: {
    machines: [],
    className: 'gap-4 w-100',
  },
};
