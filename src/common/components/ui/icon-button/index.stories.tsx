import { ArrowLeft, RefreshCw, User } from 'lucide-react';

import { IconButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { label: '새로고침' },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 44 · 누르면 soft 면이 깔린다. */
export const Default: Story = {
  render: (args) => (
    <div className="flex gap-1.5">
      <IconButton {...args}>
        <RefreshCw size={22} aria-hidden />
      </IconButton>
      <IconButton label="내 정보">
        <User size={22} aria-hidden />
      </IconButton>
      <IconButton label="뒤로">
        <ArrowLeft size={22} aria-hidden />
      </IconButton>
      <IconButton {...args} disabled>
        <RefreshCw size={22} aria-hidden />
      </IconButton>
    </div>
  ),
};
