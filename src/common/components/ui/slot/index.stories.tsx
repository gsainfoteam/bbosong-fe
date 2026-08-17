import { Button } from '../button';

import { Slot } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';
const meta: Meta<typeof Slot> = {
  title: 'Common/UI/Slot',
  component: Slot,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Slot>;

export const Basic: Story = {
  render: () => (
    <Slot className="rounded-md border border-blue-500 bg-blue-50 px-4 py-2 text-blue-700">
      <button type="button">Slot Button</button>
    </Slot>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Slot className="w-55">
      <Button>Slot + Button</Button>
    </Slot>
  ),
};

export const AsChild: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Button asChild>
        <a href="https://example.com" className="text-body-lg">
          Slot Button Link
        </a>
      </Button>
    </div>
  ),
};
