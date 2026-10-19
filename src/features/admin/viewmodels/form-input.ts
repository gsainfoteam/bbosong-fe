import { z } from 'zod';

import { Gender, Location, MachineType, UserRole } from '../models';

const room = z.object({
  gender: z.enum(Gender),
  location: z.enum(Location),
  type: z.enum(MachineType),
});
export const createMachineSchema = room.extend({
  index: z.coerce.number().int().min(1),
  matterPayload: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});
export const createMultipleMachinesSchema = room
  .extend({
    startIndex: z.coerce.number().int().min(1),
    endIndex: z.coerce.number().int().max(30),
  })
  .refine((value) => value.endIndex > value.startIndex);
export const updateMachineSchema = z.object({
  isAvailable: z.boolean(),
  posX: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number().int().optional(),
  ),
  posY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number().int().optional(),
  ),
  matterPayload: z
    .string()
    .trim()
    .transform((value) => value || undefined),
});
export const updateRoleSchema = (ownUuid?: string) =>
  z.object({
    targetUserUuid: z.uuid().refine((value) => value.toLowerCase() !== ownUuid?.toLowerCase()),
    targetRole: z.enum(UserRole),
  });
