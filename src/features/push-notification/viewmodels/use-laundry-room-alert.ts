import { useCallback, useEffect, useMemo } from 'react';

import { useMutation } from '@tanstack/react-query';

import { AnalyticsEvent, subscribeToPushMessages, trackEvent } from '@/common/lib';

import {
  subscribeLaundryRoomAlert,
  toLaundryRoomAlertKey,
  unsubscribeLaundryRoomAlert,
  type LaundryRoomAlertTarget,
} from '../models';
import { useLaundryRoomSubscriptions } from './use-laundry-room-subscriptions';
import { usePushPermission } from './use-push-device';

/**
 * 빈 기기 알림 신청/취소.
 *
 * 신청 상태는 구독 조회 API를 그대로 반영하므로 새로고침해도 유지된다.
 */
export function useLaundryRoomAlert() {
  const { status } = usePushPermission();

  // 알림을 받을 수 없는 상태에서 구독만 걸리면 사용자는 영문도 모르고 기다리게 된다
  const canSubscribe = status === 'granted';

  const {
    data: subscriptions,
    isLoading,
    isError,
    refresh: refreshSubscriptions,
  } = useLaundryRoomSubscriptions();

  const activeKeys = useMemo(
    () => new Set((subscriptions ?? []).map(toLaundryRoomAlertKey)),
    [subscriptions],
  );

  const mutation = useMutation({
    mutationFn: ({ target, next }: { target: LaundryRoomAlertTarget; next: boolean }) =>
      next ? subscribeLaundryRoomAlert(target) : unsubscribeLaundryRoomAlert(target),
    onSuccess: (_, { target, next }) => {
      trackEvent(AnalyticsEvent.LAUNDRY_ROOM_ALERT_TOGGLED, { ...target, enabled: next });
    },
    // 실패해도 서버와 화면이 어긋났을 수 있으므로 항상 다시 맞춘다
    onSettled: refreshSubscriptions,
  });

  // 빈 기기 알림은 발송 시점에 서버가 해당 구독을 자동 삭제(1회성)하므로 푸시를 받으면 다시 조회한다
  useEffect(
    () => subscribeToPushMessages(() => void refreshSubscriptions()),
    [refreshSubscriptions],
  );

  const isActive = useCallback(
    (target: LaundryRoomAlertTarget) => activeKeys.has(toLaundryRoomAlertKey(target)),
    [activeKeys],
  );

  const pendingKey =
    mutation.isPending && mutation.variables
      ? toLaundryRoomAlertKey(mutation.variables.target)
      : null;

  // 조회에 실패하면 구독 여부를 알 수 없어 신청/취소 중 무엇을 보낼지 정할 수 없다
  const isUnknown = isLoading || isError || !subscriptions;

  const isPending = useCallback(
    (target: LaundryRoomAlertTarget) => isUnknown || pendingKey === toLaundryRoomAlertKey(target),
    [isUnknown, pendingKey],
  );

  const { mutateAsync } = mutation;

  const toggle = useCallback(
    async (target: LaundryRoomAlertTarget) => {
      if (isUnknown) throw new Error('빈 기기 알림 구독 상태를 아직 알 수 없습니다.');

      const next = !activeKeys.has(toLaundryRoomAlertKey(target));
      // 권한이 없어도 이미 걸어 둔 구독은 취소할 수 있어야 한다
      if (next && !canSubscribe) return;

      try {
        await mutateAsync({ target, next });
      } catch (error) {
        console.error('빈 기기 알림 설정에 실패했습니다.', error);
        throw error;
      }
    },
    [activeKeys, canSubscribe, isUnknown, mutateAsync],
  );

  return { canSubscribe, permissionStatus: status, isActive, isPending, toggle };
}
