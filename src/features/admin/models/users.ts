import { ApiPaths, type components } from '@/@types/api-schema';
import { api } from '@/common/lib';

export type AdminUserWithSubscriptions = components['schemas']['GetUsersResDto'];

export async function findAdminUsers(signal?: AbortSignal) {
  const { data, error } = await api.GET(ApiPaths.AuthController_getUsers, { signal });
  if (error) throw error;
  return data;
}
