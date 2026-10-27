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
  'posX' | 'posY' | 'shortUrl' | 'shortCode' | 'lastSeenAt' | 'currentUsage'
> & {
  posX: number | null;
  posY: number | null;
  shortUrl: string | null;
  shortCode: string | null;
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
  };
}
export type AdminUser = components['schemas']['UserResDto'];
export type CreateMachineInput =
  operations['MachineController_createMachine']['parameters']['query'];
export type CreateMultipleMachinesInput =
  operations['MachineController_createMultipleMachines']['parameters']['query'];
export type UpdateMachineInput = components['schemas']['UpdateMachineReqDto'];
export type UpdateRoleInput = components['schemas']['UpdateRoleReqDto'];
export * from './users';
