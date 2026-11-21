import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Indicator } from './';

const meta: Meta<typeof Indicator> = {
  title: 'User/Indicator',
  component: Indicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Indicator>;

export const Default: Story = {};
