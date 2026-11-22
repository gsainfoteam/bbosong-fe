import { useFindMap } from '@/features/user/viewmodels';

import { MapScreen } from './map-screen';
import { dryers, PHONE, washers } from './story-fixtures';

import type { Meta, StoryObj } from '@storybook/react-vite';

const machines = [...washers, ...dryers];

function MapDemo({ mine = true }: { mine?: boolean }) {
  const { layout } = useFindMap('a');
  const spots = layout.spots.flatMap((spot) => {
    const machine = machines.find((item) => item.type === spot.type && item.id === spot.id);
    return machine
      ? [{ machine: mine ? machine : { ...machine, mine: false }, x: spot.x, y: spot.y }]
      : [];
  });

  return (
    <MapScreen
      room={{ title: 'A동 남자 세탁실', onOpen: () => console.log('Open room sheet') }}
      layout={layout}
      spots={spots}
      onBack={() => console.log('Back')}
    />
  );
}

const meta = {
  title: 'User/Screens/Map',
  component: MapDemo,
  parameters: { layout: 'fullscreen' },
  globals: PHONE,
} satisfies Meta<typeof MapDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoMine: Story = {
  args: { mine: false },
};
