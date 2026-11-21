import {
  type LiveActivityContentState,
  type LiveActivityKind,
  type LiveActivityPhase,
} from '@/common/lib';

/** Live Activity로 추적할 세탁기/건조기. 화면 표시용 가공은 하지 않은 값이다 */
export type LiveActivityTarget = {
  machineUuid: string;
  kind: LiveActivityKind;
  /** "A동 건조기 3번"처럼 화면에 그대로 보여줄 이름 */
  title: string;
  /** 사용 시작 시각(ISO) */
  startedAt: string | null;
  /** 기계 상태(`IDLE`이면 사용이 끝난 것) */
  status?: string;
  /** ThinQ `runState.currentState` */
  thinqCurrentState?: string | null;
  remainingMinutes: number | null;
  /** `remainingMinutes`를 조회한 시각(ISO) */
  thinqUpdatedAt: string | null;
};

const FINISHED_THINQ_STATES = new Set(['END', 'POWER_OFF', 'SLEEP', 'INITIAL', 'WRINKLE_CARE']);

/** 서버(bbosong-be `mapThinqStateToLiveActivityState`)와 같은 규칙. 모르는 상태는 가동 중으로 본다 */
function toPhase(
  target: Pick<LiveActivityTarget, 'status' | 'thinqCurrentState'>,
): LiveActivityPhase {
  const { status, thinqCurrentState } = target;
  if (status === 'IDLE') return 'END';

  switch (thinqCurrentState) {
    case 'COOLING':
    case 'PAUSE':
    case 'DETECTING':
    case 'ERROR':
      return thinqCurrentState;
    default:
      return thinqCurrentState && FINISHED_THINQ_STATES.has(thinqCurrentState) ? 'END' : 'RUNNING';
  }
}

/**
 * 조회한 데이터로 Live Activity의 처음(또는 보정) 내용을 만든다. 이후 갱신은 서버 푸시가 맡는다.
 * 종료 예상 시각은 `thinqUpdatedAt + remainingMinutes`다. 이미 지났거나 알 수 없으면 시간 없이 보여준다.
 */
export function toLiveActivityContentState(
  target: LiveActivityTarget,
  nowMs: number,
): LiveActivityContentState {
  const phase = toPhase(target);
  const nowSeconds = Math.floor(nowMs / 1000);
  if (phase === 'END') {
    return { state: 'END', endsAt: nowSeconds, remainingMinutes: 0, updatedAt: nowSeconds };
  }
  // 세탁기는 ThinQ가 아니라 남은 시간을 모른다. 위젯이 경과 시간을 보여주므로 시간 없는 가동 중으로 둔다
  if (target.kind === 'WASHER') {
    return { state: 'RUNNING', endsAt: null, remainingMinutes: null, updatedAt: nowSeconds };
  }

  const updatedAtMs = target.thinqUpdatedAt ? Date.parse(target.thinqUpdatedAt) : Number.NaN;
  const { remainingMinutes } = target;
  if (remainingMinutes === null || !Number.isFinite(updatedAtMs)) {
    return {
      state: phase === 'RUNNING' ? 'DETECTING' : phase,
      endsAt: null,
      remainingMinutes: null,
      updatedAt: nowSeconds,
    };
  }

  const endsAtMs = updatedAtMs + remainingMinutes * 60_000;
  if (endsAtMs <= nowMs) {
    return { state: phase, endsAt: null, remainingMinutes: null, updatedAt: nowSeconds };
  }

  return {
    state: phase,
    endsAt: Math.floor(endsAtMs / 1000),
    remainingMinutes,
    updatedAt: Math.floor(updatedAtMs / 1000),
  };
}

/** 화면에 같은 내용이면 같은 값. 이 값이 바뀔 때만 네이티브에 다시 알린다 */
export function liveActivityTargetKey(target: LiveActivityTarget): string {
  return [
    target.machineUuid,
    target.kind,
    target.title,
    target.status ?? '',
    target.thinqCurrentState ?? '',
    target.remainingMinutes ?? '',
    target.thinqUpdatedAt ?? '',
  ].join(':');
}

/** 사용 시작 시각을 epoch 초로 바꾼다. 알 수 없거나 미래 값이면 지금으로 본다 */
export function toStartedAtSeconds(startedAt: string | null, nowMs: number): number {
  const startedAtMs = startedAt ? Date.parse(startedAt) : Number.NaN;

  return Math.floor((Number.isFinite(startedAtMs) ? Math.min(startedAtMs, nowMs) : nowMs) / 1000);
}
