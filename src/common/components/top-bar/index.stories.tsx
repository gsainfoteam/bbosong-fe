import { TopBar } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/TopBar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
  args: { onBack: () => console.log('Back') },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BackOnly: Story = {};

export const WithTitle: Story = {
  args: { title: '개인정보 처리 방침' },
};

export const CloseOnDark: Story = {
  args: { title: 'QR 찍고 내 빨래 등록', icon: 'close' },
  decorators: [
    (Story) => (
      <div className="bg-[#121316] text-white">
        <Story />
      </div>
    ),
  ],
};
