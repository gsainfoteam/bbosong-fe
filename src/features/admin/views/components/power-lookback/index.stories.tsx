import { type Meta, type StoryObj } from '@storybook/react-vite';

import { PowerLookbackButtons } from '.';

const meta = {
  title: 'Admin/PowerLookbackButtons',
  component: PowerLookbackButtons,
} satisfies Meta<typeof PowerLookbackButtons>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Enabled: Story = { args: { disabled: false, onLookback: () => {} } };
export const Disabled: Story = { args: { disabled: true, onLookback: () => {} } };
