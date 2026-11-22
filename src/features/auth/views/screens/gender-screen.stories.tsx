import { GenderScreen } from './gender-screen';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Auth/Screens/Gender',
  component: GenderScreen,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone', isRotated: false } },
  args: { onSelect: (gender) => console.log('Select', gender) },
} satisfies Meta<typeof GenderScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getAllByRole('radio')[0]);
  },
};
