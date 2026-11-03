import { useQuery } from '@tanstack/react-query';

import { api } from '@/common/lib';

import { ApiPaths, type ThinqDevice } from '../models';

function isThinqDevice(value: unknown): value is ThinqDevice {
  if (!value || typeof value !== 'object') return false;
  const device = value as Partial<ThinqDevice>;
  return (
    typeof device.deviceId === 'string' &&
    !!device.deviceInfo &&
    typeof device.deviceInfo === 'object' &&
    typeof device.deviceInfo.deviceType === 'string' &&
    typeof device.deviceInfo.modelName === 'string' &&
    typeof device.deviceInfo.alias === 'string'
  );
}

export function useAdminThinqDevices(enabled: boolean) {
  return useQuery({
    queryKey: ['get', ApiPaths.MachineController_getThinqDevices],
    enabled,
    retry: false,
    queryFn: async (): Promise<ThinqDevice[]> => {
      // OpenAPI에 응답 스키마가 없어도 openapi-fetch는 기본 parseAs:"json"으로 body를 먼저 읽는다.
      const { data, response, error } = await api.GET(ApiPaths.MachineController_getThinqDevices);
      if (!response.ok) {
        throw error ?? new Error(`ThinQ devices request failed (${response.status})`);
      }
      const body: unknown = data;
      if (!Array.isArray(body) || body.some((device) => !isThinqDevice(device))) {
        throw new Error('Invalid ThinQ device list.');
      }
      return body;
    },
  });
}

export function formatThinqDeviceLabel(device: ThinqDevice) {
  const { alias, modelName } = device.deviceInfo;
  return `${alias} · ${modelName} (${device.deviceId})`;
}
