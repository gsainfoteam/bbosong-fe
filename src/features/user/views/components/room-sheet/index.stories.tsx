import { RoomSheet } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/RoomSheet',
  component: RoomSheet,
  args: {
    open: true,
    rooms: [
      { location: 'a', label: 'A동 남자', freeWashers: 2, freeDryers: 0, selected: true },
      { location: 'b', label: 'B동 남자', freeWashers: 0, freeDryers: 1, selected: false },
    ],
    onSelect: (location) => console.log(`Select ${location}`),
    onClose: () => console.log('Close'),
  },
} satisfies Meta<typeof RoomSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
