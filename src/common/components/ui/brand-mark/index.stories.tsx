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

// 헤더(26) · 스플래시(112) · 동의 화면(120)에서 쓰는 크기와 파비콘 크기를 함께 본다.
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {[16, 26, 64, 112, 120].map((size) => (
        <BrandMark key={size} size={size} />
      ))}
    </div>
  ),
};

// 회색 바탕 위에서도 두 모양 사이 틈에 흰 테가 생기지 않는지 본다.
export const OnSoft: Story = {
  render: (args) => (
    <div className="bg-soft p-6">
      <BrandMark {...args} />
    </div>
  ),
};
