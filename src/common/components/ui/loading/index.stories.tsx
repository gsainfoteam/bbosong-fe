import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Loading } from '.';

const meta: Meta<typeof Loading> = {
  title: 'Common/UI/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {};
