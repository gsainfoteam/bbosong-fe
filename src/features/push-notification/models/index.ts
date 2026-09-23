import {
  ApiPaths,
  PathsMachinePostParametersQueryLocation,
  PathsMachinePostParametersQueryType,
  PathsMachineSummaryGetParametersQueryGender,
  type components,
} from '@/@types/api-schema';
import { api } from '@/common/lib';

export { ApiPaths };

/** 세탁실 위치 (A동 / B동) */
export const AlertLocation = PathsMachinePostParametersQueryLocation;
export type AlertLocation = PathsMachinePostParametersQueryLocation;

/** 세탁실 성별 구역 */
export const AlertGender = PathsMachineSummaryGetParametersQueryGender;
export type AlertGender = PathsMachineSummaryGetParametersQueryGender;

/** 기기 종류 (세탁기 / 건조기) */
export const AlertMachineType = PathsMachinePostParametersQueryType;
export type AlertMachineType = PathsMachinePostParametersQueryType;

/** 빈 기기 알림 구독 단위: (location, gender, type) 조합 1건 */
export type LaundryRoomAlertTarget = components['schemas']['SubscribeLaundryRoomReqDto'];

/** 조합을 로컬 상태의 키로 직렬화한다 */
export function toLaundryRoomAlertKey({ location, gender, type }: LaundryRoomAlertTarget): string {
  return `${location}-${gender}-${type}`;
}

/**
 * 디바이스 푸시 구독을 등록/갱신한다.
 *
 * endpoint 유니크 키 기준 upsert이므로 멱등하다. 앱 실행/로그인마다 호출해도 안전하다.
 *
 * User-Agent는 백엔드가 요청 헤더에서 직접 읽으므로 body에 넣지 않는다.
 * Swagger가 user-agent를 필수 헤더 파라미터로 선언하지만 **프런트에서 설정하면 안 된다.**
 * 브라우저가 알아서 붙이는 값인 데다, 직접 설정하면 CORS 프리플라이트의
 * Access-Control-Request-Headers에 user-agent가 실리는데 백엔드의 허용 헤더는
 * Content-Type,Authorization뿐이라 본 요청이 차단된다.
 * (dev는 /api 프록시로 동일 출처라 드러나지 않고 배포 환경에서만 터진다)
 * 그래서 params를 아예 넘기지 않고, 필수 파라미터 타입만 캐스팅으로 우회한다.
 * body는 satisfies로 타입 검사를 유지한다.
 */
export async function registerPushDevice(subscription: PushSubscription) {
  const { endpoint, keys } = subscription.toJSON();

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error('푸시 구독에서 endpoint 또는 암호화 키를 읽을 수 없습니다.');
  }

  const body = {
    endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
  } satisfies components['schemas']['SubscribeReqDto'];

  const { data, error } = await api.POST(ApiPaths.NotificationController_registerPush, {
    body,
  } as never);

  if (error) throw error;

  return data;
}

/**
 * 디바이스 푸시 구독을 해제한다.
 *
 * Swagger에는 requestBody가 선언되어 있지 않지만 백엔드는 endpoint를 body로 받는다.
 * 스펙이 갱신되면 캐스팅을 제거할 것.
 */
export async function unregisterPushDevice(endpoint: string) {
  const { data, error } = await api.DELETE(ApiPaths.NotificationController_unregisterPush, {
    body: { endpoint },
  } as never);

  if (error) throw error;

  return data;
}

/** 빈 기기 알림을 신청한다. 동일 조합 중복 호출은 안전하다 */
export async function subscribeLaundryRoomAlert(target: LaundryRoomAlertTarget) {
  const { data, error } = await api.POST(ApiPaths.NotificationController_subscribeLaundryRoom, {
    body: target,
  });

  if (error) throw error;

  return data;
}

/** 빈 기기 알림 신청을 취소한다 */
export async function unsubscribeLaundryRoomAlert(target: LaundryRoomAlertTarget) {
  const { data, error } = await api.DELETE(ApiPaths.NotificationController_unsubscribeLaundryRoom, {
    body: target,
  });

  if (error) throw error;

  return data;
}
