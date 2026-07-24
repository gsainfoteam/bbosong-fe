import { LoginScreen } from './login-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Auth/LoginScreen',
  component: LoginScreen,
} satisfies Meta<typeof LoginScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onLogin: () => console.log('login'),
  },
};
