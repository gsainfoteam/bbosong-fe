import { BrandMark } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/BrandMark',
  component: BrandMark,
  args: { size: 64 },
} satisfies Meta<typeof BrandMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {[16, 26, 44, 112].map((size) => (
        <BrandMark key={size} size={size} />
      ))}
    </div>
  ),
};

export const OnSoft: Story = {
  render: (args) => (
    <div className="bg-soft p-6">
      <BrandMark {...args} />
    </div>
  ),
};
