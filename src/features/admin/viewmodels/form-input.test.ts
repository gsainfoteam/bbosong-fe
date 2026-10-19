import { describe, expect, it } from 'vitest';

import { Gender, Location, MachineType, UserRole } from '../models';
import {
  createMachineSchema,
  createMultipleMachinesSchema,
  updateMachineSchema,
  updateRoleSchema,
} from './form-input';

const room = { gender: Gender.MALE, location: Location.A, type: MachineType.WASHER };
describe('admin form validation', () => {
  it('converts machine numbers and omits empty optional payloads', () => {
    expect(createMachineSchema.parse({ ...room, index: '4', matterPayload: ' ' })).toEqual({
      ...room,
      index: 4,
      matterPayload: undefined,
    });
  });
  it.each(['0', '-1', '1.5', '', 'abc'])('rejects invalid machine number %s', (index) => {
    expect(createMachineSchema.safeParse({ ...room, index }).success).toBe(false);
  });
  it.each([
    [1, 1],
    [5, 3],
    [1, 31],
    [0, 10],
    [1.5, 5],
  ])('rejects invalid batch range %s–%s', (startIndex, endIndex) => {
    expect(createMultipleMachinesSchema.safeParse({ ...room, startIndex, endIndex }).success).toBe(
      false,
    );
  });
  it('accepts the inclusive batch range ending at 30', () => {
    expect(
      createMultipleMachinesSchema.parse({ ...room, startIndex: '1', endIndex: '30' }),
    ).toEqual({ ...room, startIndex: 1, endIndex: 30 });
  });
  it('preserves unspecified coordinates and allows zero and negative coordinates', () => {
    expect(
      updateMachineSchema.parse({ isAvailable: false, posX: '', posY: '', matterPayload: '' }),
    ).toEqual({ isAvailable: false, posX: undefined, posY: undefined, matterPayload: undefined });
    expect(
      updateMachineSchema.parse({
        isAvailable: true,
        posX: '0',
        posY: '-5',
        matterPayload: ' MT:123 ',
      }),
    ).toEqual({ isAvailable: true, posX: 0, posY: -5, matterPayload: 'MT:123' });
  });
  it('rejects changing own role, including UUID casing differences', () => {
    const uuid = '123e4567-e89b-42d3-a456-426614174000';
    expect(
      updateRoleSchema(uuid).safeParse({
        targetUserUuid: uuid.toUpperCase(),
        targetRole: UserRole.USER,
      }).success,
    ).toBe(false);
  });
  it('requires a valid UUID and accepts changing another user', () => {
    expect(
      updateRoleSchema().safeParse({ targetUserUuid: 'invalid', targetRole: UserRole.ADMIN })
        .success,
    ).toBe(false);
    expect(
      updateRoleSchema('123e4567-e89b-42d3-a456-426614174000').safeParse({
        targetUserUuid: '123e4567-e89b-42d3-a456-426614174001',
        targetRole: UserRole.ADMIN,
      }).success,
    ).toBe(true);
  });
});
