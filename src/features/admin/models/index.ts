import { type components, type operations } from '@/@types/api-schema';

export {
  ApiPaths,
  PathsMachineSummaryGetParametersQueryGender as Gender,
  PathsMachinePostParametersQueryLocation as Location,
  PathsMachinePostParametersQueryType as MachineType,
  GetMachineResDtoStatus as MachineStatus,
  GetUsersResDtoRole as UserRole,
} from '@/@types/api-schema';

// Optional for backends that omit connectivity or the current usage session.
type AdminMachineTiming = {
  lastSeenAt?: string | null;
  currentUsage?: Pick<components['schemas']['MachineUsageInfoDto'], 'startedAt'> | null;
};
// Swagger represents these nullable scalar fields as objects. Normalize them at the model boundary.
export type AdminMachine = Omit<
  components['schemas']['GetMachineResDto'],
  | 'posX'
  | 'posY'
  | 'shortUrl'
  | 'shortCode'
  | 'lastSeenAt'
  | 'currentUsage'
  | 'thinqDeviceId'
  | 'thinqCurrentState'
  | 'thinqRemainingMinutes'
  | 'thinqUpdatedAt'
> & {
  posX: number | null;
  posY: number | null;
  shortUrl: string | null;
  shortCode: string | null;
  thinqDeviceId: string | null;
  thinqCurrentState: string | null;
  thinqRemainingMinutes: number | null;
  thinqUpdatedAt: string | null;
} & AdminMachineTiming;
export function normalizeAdminMachine(
  machine: components['schemas']['GetMachineResDto'] & AdminMachineTiming,
): AdminMachine {
  return {
    ...machine,
    posX: typeof machine.posX === 'number' ? machine.posX : null,
    posY: typeof machine.posY === 'number' ? machine.posY : null,
    shortUrl: typeof machine.shortUrl === 'string' ? machine.shortUrl : null,
    shortCode: typeof machine.shortCode === 'string' ? machine.shortCode : null,
    thinqDeviceId: typeof machine.thinqDeviceId === 'string' ? machine.thinqDeviceId : null,
    thinqCurrentState:
      typeof machine.thinqCurrentState === 'string' ? machine.thinqCurrentState : null,
    thinqRemainingMinutes:
      typeof machine.thinqRemainingMinutes === 'number' ? machine.thinqRemainingMinutes : null,
    thinqUpdatedAt: typeof machine.thinqUpdatedAt === 'string' ? machine.thinqUpdatedAt : null,
  };
}
/** BE `ThinqService.getDevices()` 응답. OpenAPI에 응답 스키마가 없어 수동 정의. */
export type ThinqDevice = {
  deviceId: string;
  deviceInfo: {
    deviceType: string;
    modelName: string;
    alias: string;
  };
};
export type AdminUser = components['schemas']['UserResDto'];
export type CreateMachineInput =
  operations['MachineController_createMachine']['parameters']['query'];
export type CreateMultipleMachinesInput =
  operations['MachineController_createMultipleMachines']['parameters']['query'];
export type UpdateMachineInput = Omit<
  components['schemas']['UpdateMachineReqDto'],
  'thinqDeviceId'
> & {
  thinqDeviceId?: string | null;
};
export type UpdateRoleInput = components['schemas']['UpdateRoleReqDto'];
export * from './users';
