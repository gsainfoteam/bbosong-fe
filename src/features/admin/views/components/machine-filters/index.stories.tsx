import { useState } from 'react';

import { type Meta, type StoryObj } from '@storybook/react-vite';

import { MachineFilters } from '.';

const meta = { title: 'Admin/MachineFilters', component: MachineFilters } satisfies Meta<
  typeof MachineFilters
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    filters: {
      search: '',
      setSearch: () => {},
      location: '',
      setLocation: () => {},
      gender: '',
      setGender: () => {},
      type: '',
      setType: () => {},
    },
  },
  render: function Render() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [gender, setGender] = useState('');
    const [type, setType] = useState('');
    return (
      <MachineFilters
        filters={{ search, setSearch, location, setLocation, gender, setGender, type, setType }}
      />
    );
  },
};
