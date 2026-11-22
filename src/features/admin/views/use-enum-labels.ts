import { useTranslation } from 'react-i18next';

import { type Gender, type MachineStatus, type MachineType, type UserRole } from '../viewmodels';

// API enum 값을 키로 그대로 넘기면 추출기가 키를 못 보고 지운다. enum에 값이 늘면 satisfies가 빈 칸을 잡는다.
export function useEnumLabels() {
  const { t } = useTranslation('admin');

  return {
    gender: { MALE: t('MALE'), FEMALE: t('FEMALE') } satisfies Record<Gender, string>,
    role: { USER: t('USER'), ADMIN: t('ADMIN') } satisfies Record<UserRole, string>,
    machineType: { WASHER: t('WASHER'), DRYER: t('DRYER') } satisfies Record<MachineType, string>,
    status: {
      IDLE: t('IDLE'),
      WASH: t('WASH'),
      RINSE: t('RINSE'),
      SPIN: t('SPIN'),
      DRY: t('DRY'),
    } satisfies Record<MachineStatus, string>,
  };
}
