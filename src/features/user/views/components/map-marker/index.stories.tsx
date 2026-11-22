import { MapMarker } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const STATES = [
  { state: 'idle' },
  { state: 'running', level: 0.6 },
  { state: 'paused', level: 0.5 },
  { state: 'detecting' },
  { state: 'elapsed' },
  { state: 'off' },
] as const satisfies Omit<MapMarker.Props, 'type'>[];

const meta = {
  title: 'User/MapMarker',
  component: MapMarker,
  args: { type: 'washer', state: 'idle', id: 3 },
} satisfies Meta<typeof MapMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(6,56px)] place-items-center gap-y-6 py-6">
      {(['washer', 'dryer'] as const).flatMap((type) =>
        [false, true].flatMap((mine) =>
          STATES.map((props) => (
            <MapMarker
              key={`${type}${mine}${props.state}`}
              type={type}
              id={3}
              mine={mine}
              {...props}
            />
          )),
        ),
      )}
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div className="flex gap-3">
      {STATES.map((props) => (
        <MapMarker key={props.state} type="washer" size="s" {...props} />
      ))}
      <MapMarker type="washer" state="running" level={1} size="s" mine />
    </div>
  ),
};
