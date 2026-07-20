import { UsingMachineBox } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/UsingMachineBox',
  component: UsingMachineBox,
} satisfies Meta<typeof UsingMachineBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    machine: {
      type: 'washer',
      id: 1,
    },
    location: 'a',
    onClear: () => console.log(1),
    className: 'w-100',
  },
};