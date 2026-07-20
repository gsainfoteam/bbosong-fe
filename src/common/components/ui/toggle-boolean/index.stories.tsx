import { useState } from 'react';

import { ToggleBoolean } from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/ToggleBoolean',
  component: ToggleBoolean,
} satisfies Meta<typeof ToggleBoolean>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    state: false,
    available: true,
  },
  render: (args) => {
    const [state, setState] = useState(args.state);
    return (
      <ToggleBoolean
        {...args}
        state={state}
        onChange={() => setState((prev) => !prev)}
      />
    );
  },
};

export const Active: Story = {
  args: {
    state: true,
    available: true,
  },
  render: (args) => {
    const [state, setState] = useState(args.state);
    return (
      <ToggleBoolean
        {...args}
        state={state}
        onChange={() => setState((prev) => !prev)}
      />
    );
  },
};

export const Small: Story = {
  args: {
    state: false,
    available: true,
    size: 'sm',
  },
  render: (args) => {
    const [state, setState] = useState(args.state);
    return (
      <ToggleBoolean
        {...args}
        state={state}
        onChange={() => setState((prev) => !prev)}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    state: false,
    available: false,
  },
};
