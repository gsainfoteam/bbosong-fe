import { LoginScreen } from './login-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Auth/Screens/Login',
  component: LoginScreen,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone', isRotated: false } },
  args: { onLogin: () => console.log('Login') },
} satisfies Meta<typeof LoginScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { isPending: true },
};
