import { GenderSelect, IdpLoginButton, LoginLayoutScreen } from '@/features/auth';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Auth/LoginLayoutScreen',
  component: LoginLayoutScreen,
} satisfies Meta<typeof LoginLayoutScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IdpLogin: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <LoginLayoutScreen {...args}>
      <IdpLoginButton onLogin={() => console.log('Idp Login Clicked')} />
    </LoginLayoutScreen>
  ),
};

export const GenderSelection: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <LoginLayoutScreen {...args}>
      <GenderSelect onLogin={(gender) => console.log(`Gender Selected: ${gender}`)} />
    </LoginLayoutScreen>
  ),
};
