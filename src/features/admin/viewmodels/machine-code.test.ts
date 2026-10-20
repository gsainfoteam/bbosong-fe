import { describe, expect, it } from 'vitest';

import { Gender, Location, MachineType } from '../models';
import { formatMachineCode } from './machine-code';

describe('formatMachineCode', () => {
  it('joins laundry room, gender, machine type, and number', () => {
    expect(
      formatMachineCode({
        location: Location.A,
        gender: Gender.MALE,
        type: MachineType.WASHER,
        index: 2,
      }),
    ).toBe('AMW2');
    expect(
      formatMachineCode({
        location: Location.B,
        gender: Gender.FEMALE,
        type: MachineType.DRYER,
        index: 10,
      }),
    ).toBe('BFD10');
  });
});
