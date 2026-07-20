import { WasherPowerChart } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/WasherPowerChart',
  component: WasherPowerChart,

  decorators: [
    (Story) => (
      <div style={{ width: '900px', padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WasherPowerChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};