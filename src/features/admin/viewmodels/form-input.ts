import { z } from 'zod';

import { Gender, Location, MachineType, UserRole } from '../models';

const room = z.object({
  gender: z.enum(Gender),
  location: z.enum(Location),
  type: z.enum(MachineType),
});
const optionalMatterPayload = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);
const optionalThinqDeviceId = z
  .string()
  .optional()
  .transform((value) => value || undefined);
export const createMachineSchema = room
  .extend({
    index: z.coerce.number().int().min(1),
    matterPayload: optionalMatterPayload,
    thinqDeviceId: optionalThinqDeviceId,
  })
  .transform((value) => {
    // ThinQ 건조기는 Matter 페이로드 없이 동작한다. 둘 다 오면 ThinQ를 우선한다.
    if (value.type === MachineType.DRYER && value.thinqDeviceId) {
      return { ...value, matterPayload: undefined };
    }
    if (value.type !== MachineType.DRYER) {
      return { ...value, thinqDeviceId: undefined };
    }
    return value;
  });
export const createMultipleMachinesSchema = room
  .extend({
    startIndex: z.coerce.number().int().min(1),
    endIndex: z.coerce.number().int().max(30),
  })
  .refine((value) => value.endIndex > value.startIndex);
export const updateMachineSchema = z
  .object({
    isAvailable: z.boolean(),
    posX: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.coerce.number().int().optional(),
    ),
    posY: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.coerce.number().int().optional(),
    ),
    matterPayload: optionalMatterPayload,
    thinqDeviceId: z.string().optional(),
    type: z.enum(MachineType).optional(),
  })
  .transform((value) => {
    const { type, thinqDeviceId, ...rest } = value;
    if (type !== MachineType.DRYER) {
      return { ...rest, thinqDeviceId: undefined };
    }
    // 빈 값은 매핑 해제(null). OpenAPI/Swagger nullable 필드와 맞춘다.
    return {
      ...rest,
      thinqDeviceId: thinqDeviceId ? thinqDeviceId : null,
      ...(thinqDeviceId ? { matterPayload: undefined } : {}),
    };
  });
export const updateRoleSchema = (ownUuid?: string) =>
  z.object({
    targetUserUuid: z.uuid().refine((value) => value.toLowerCase() !== ownUuid?.toLowerCase()),
    targetRole: z.enum(UserRole),
  });
