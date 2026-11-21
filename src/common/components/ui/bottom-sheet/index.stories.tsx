import { useState } from 'react';

import { Button } from '../button';

import { BottomSheet } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/BottomSheet',
  component: BottomSheet,
  args: {
    open: true,
    onClose: () => {},
    title: '세탁실 바꾸기',
    children: <p className="text-ink-2 text-sm">아래로 밀거나 바깥을 누르면 닫힌다.</p>,
  },
} satisfies Meta<typeof BottomSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: { title: undefined, 'aria-label': '알림 켜기' },
};

export const Toggle: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          열기
        </Button>
        <BottomSheet {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
};
