import { RemainingTimeSheet } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/RemainingTimeSheet',
  component: RemainingTimeSheet,
  args: {
    open: true,
    onSubmit: (minutes) => console.log('Submit', minutes),
    onClose: () => console.log('Close'),
  },
} satisfies Meta<typeof RemainingTimeSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Editing: Story = { args: { initialMinutes: 37 } };

export const Pending: Story = { args: { initialMinutes: 37, isPending: true } };

export const WithUnregister: Story = {
  args: { initialMinutes: 37, onUnregister: () => console.log('Unregister') },
};
