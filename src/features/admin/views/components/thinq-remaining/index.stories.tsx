import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ThinqRemaining } from '.';

const meta = {
  title: 'Admin/ThinqRemaining',
  component: ThinqRemaining,
} satisfies Meta<typeof ThinqRemaining>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Unknown: Story = { args: { remaining: null } };
export const Detecting: Story = { args: { remaining: null, isDetecting: true } };
export const Minutes: Story = { args: { remaining: { hours: 0, minutes: 25 } } };
export const HoursAndMinutes: Story = { args: { remaining: { hours: 1, minutes: 5 } } };
