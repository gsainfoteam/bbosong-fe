import { MachineCompletionDialog } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/MachineCompletionDialog',
  component: MachineCompletionDialog,
  args: { isPending: false, onConfirm: () => {}, onClose: () => {} },
} satisfies Meta<typeof MachineCompletionDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Pending: Story = { args: { isPending: true } };
