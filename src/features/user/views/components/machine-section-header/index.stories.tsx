import { MachineSectionHeader } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MachineSectionHeader',
  component: MachineSectionHeader,
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
  args: {
    title: '세탁기',
    machineType: 'washer',
    freeCount: 2,
    roomNotification: {
      machineType: 'washer',
      active: false,
      onToggle: () => console.log('Toggle'),
    },
  },
} satisfies Meta<typeof MachineSectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Washer: Story = {};

export const Dryer: Story = {
  args: {
    title: '건조기',
    machineType: 'dryer',
    freeCount: 1,
    roomNotification: { machineType: 'dryer', active: false, onToggle: () => {} },
  },
};

/** 빈 자리가 없으면 "빈 자리 알림" 버튼이 붙는다. */
export const NoFree: Story = {
  args: {
    title: '건조기',
    machineType: 'dryer',
    freeCount: 0,
    roomNotification: { machineType: 'dryer', active: false, onToggle: () => {} },
  },
};

export const NoFreeActive: Story = {
  args: {
    ...NoFree.args,
    roomNotification: { machineType: 'dryer', active: true, onToggle: () => {} },
  },
};
