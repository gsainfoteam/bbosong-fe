import { Header } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Header> = {
  title: 'Common/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const WithRefresh: Story = {
  args: {
    onRefresh: () => console.log('Refresh'),
  },
};

export const Refreshing: Story = {
  args: {
    onRefresh: () => console.log('Refresh'),
    isRefreshing: true,
  },
};

// 메인 화면에서 쓰는 조합
export const WithRegister: Story = {
  args: {
    onRegister: () => console.log('Register'),
    onRefresh: () => console.log('Refresh'),
  },
};
