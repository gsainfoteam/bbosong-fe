import { WelcomeMessage } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/WelcomeMessage',
  component: WelcomeMessage,
} satisfies Meta<typeof WelcomeMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: '홍길동',
  },
};

export const English: Story = {
  args: {
    text: 'John',
  },
};