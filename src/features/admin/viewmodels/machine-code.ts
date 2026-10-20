import { type AdminMachine } from '../models';

const genderCode = { MALE: 'M', FEMALE: 'F' } as const;
const typeCode = { WASHER: 'W', DRYER: 'D' } as const;

/** 세탁실, 성별, 기기 종류, 번호를 이어 붙인 기기 번호. 예: A동 남성 세탁기 2번 → AMW2 */
export function formatMachineCode(
  machine: Pick<AdminMachine, 'location' | 'gender' | 'type' | 'index'>,
): string {
  return `${machine.location}${genderCode[machine.gender]}${typeCode[machine.type]}${machine.index}`;
}
