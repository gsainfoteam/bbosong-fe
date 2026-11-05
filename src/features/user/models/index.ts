import { type components } from '@/@types/api-schema';

export type Machine = {
  id: number;
  type: 'WASHER' | 'DRYER';
  x: number;
  y: number;
};

export type MachineListItem = components['schemas']['GetMachineResDto'];

export { ApiPaths } from '@/@types/api-schema';
