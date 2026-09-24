import { useCallback, useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { subscribeToPushMessages } from '@/common/lib';

import {
  subscribeLaundryRoomAlert,
  toLaundryRoomAlertKey,
  unsubscribeLaundryRoomAlert,
  type LaundryRoomAlertTarget,
} from '../models';
import { usePushPermission } from './use-push-device';

/**
 * 빈 기기 알림 신청/취소.
 *
 * TODO: 구독 조회 API(GET /notification/laundry-room)가 없어 신청 상태를 로컬로만 들고 있다.
 *       새로고침하면 UI는 꺼진 것처럼 보이지만 서버에는 구독이 남아 있을 수 있다.
 *       조회 API가 추가되면 TanStack Query로 서버 상태를 그대로 반영하도록 교체할 것.
 *       그때까지 UI 문구는 상태 유지 기대를 낮추도록 "일회성 신청"으로 표현한다.
 */
export function useLaundryRoomAlert() {
  const { status } = usePushPermission();
  const [activeKeys, setActiveKeys] = useState<ReadonlySet<string>>(() => new Set());
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // 알림을 받을 수 없는 상태에서 구독만 걸리면 사용자는 영문도 모르고 기다리게 된다
  const canSubscribe = status === 'granted';

  const { mutateAsync } = useMutation({
    mutationFn: ({ target, next }: { target: LaundryRoomAlertTarget; next: boolean }) =>
      next ? subscribeLaundryRoomAlert(target) : unsubscribeLaundryRoomAlert(target),
  });

  // 빈 기기 알림은 발송 시점에 서버가 해당 구독을 자동 삭제(1회성)한다.
  // 그런데 현재 푸시 페이로드의 data가 비어 있어 어떤 조합이 삭제됐는지 알 방법이 없으므로
  // 부득이하게 로컬 신청 상태를 전부 비운다. 여러 조합을 신청 중이었다면 관계없는 항목까지 꺼진다.
  // TODO: 백엔드가 페이로드에 data: { location, gender, type }를 실어 주면 해당 항목만 해제할 것.
  useEffect(() => {
    return subscribeToPushMessages(() => {
      setActiveKeys(new Set());
    });
  }, []);

  const isActive = useCallback(
    (target: LaundryRoomAlertTarget) => activeKeys.has(toLaundryRoomAlertKey(target)),
    [activeKeys],
  );

  const isPending = useCallback(
    (target: LaundryRoomAlertTarget) => pendingKey === toLaundryRoomAlertKey(target),
    [pendingKey],
  );

  const toggle = useCallback(
    async (target: LaundryRoomAlertTarget) => {
      if (!canSubscribe) return;

      const key = toLaundryRoomAlertKey(target);
      const next = !activeKeys.has(key);

      setPendingKey(key);
      try {
        await mutateAsync({ target, next });

        setActiveKeys((prev) => {
          const draft = new Set(prev);
          if (next) draft.add(key);
          else draft.delete(key);
          return draft;
        });
      } catch (error) {
        console.error('빈 기기 알림 설정에 실패했습니다.', error);
        throw error;
      } finally {
        setPendingKey(null);
      }
    },
    [activeKeys, canSubscribe, mutateAsync],
  );

  return { canSubscribe, permissionStatus: status, isActive, isPending, toggle };
}
