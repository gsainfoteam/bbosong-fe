package me.gistory.bbosong.liveupdate;

import java.util.Map;

/**
 * 서버(bbosong-be)가 보내는 `LIVE_UPDATE` FCM data 메시지.
 *
 * 모든 값은 문자열이고, null은 값이 빈 문자열이 아니라 키 생략이다. 시간은 epoch 초다.
 * Android 의존성이 없어 JVM 단위 테스트로 검증한다.
 */
public final class LiveUpdateMessage {

    public static final String TYPE = "LIVE_UPDATE";

    /** 종료 신호 */
    public static final String STATE_END = "END";

    public static final String STATE_ERROR = "ERROR";
    public static final String STATE_PAUSE = "PAUSE";
    public static final String STATE_DETECTING = "DETECTING";
    public static final String STATE_COOLING = "COOLING";

    public static final String KIND_WASHER = "WASHER";
    public static final String KIND_DRYER = "DRYER";

    public final String machineUuid;
    public final String kind;
    public final String title;
    public final String state;
    public final long updatedAtSeconds;
    /** 알 때만 */
    public final Long startedAtSeconds;
    /** 알 때만. 남은 시간을 모르면 null */
    public final Long endsAtSeconds;

    LiveUpdateMessage(
        String machineUuid,
        String kind,
        String title,
        String state,
        long updatedAtSeconds,
        Long startedAtSeconds,
        Long endsAtSeconds
    ) {
        this.machineUuid = machineUuid;
        this.kind = kind;
        this.title = title;
        this.state = state;
        this.updatedAtSeconds = updatedAtSeconds;
        this.startedAtSeconds = startedAtSeconds;
        this.endsAtSeconds = endsAtSeconds;
    }

    /** `LIVE_UPDATE`가 아니거나 필수 값이 빠지면 null. 호출하는 쪽은 다른 메시지로 처리한다 */
    public static LiveUpdateMessage fromData(Map<String, String> data) {
        if (data == null || !TYPE.equals(data.get("type"))) return null;

        String machineUuid = nonEmpty(data.get("machineUuid"));
        String state = nonEmpty(data.get("state"));
        if (machineUuid == null || state == null) return null;

        String kind = KIND_WASHER.equals(data.get("kind")) ? KIND_WASHER : KIND_DRYER;
        String title = data.get("title") == null ? "" : data.get("title");
        Long updatedAt = parseLong(data.get("updatedAt"));

        return new LiveUpdateMessage(
            machineUuid,
            kind,
            title,
            state,
            updatedAt == null ? System.currentTimeMillis() / 1000 : updatedAt,
            parseLong(data.get("startedAt")),
            parseLong(data.get("endsAt"))
        );
    }

    public boolean isFinished() {
        return STATE_END.equals(state) || STATE_ERROR.equals(state);
    }

    /** 사용 시작을 모르면 `updatedAt`을 쓴다(진행 막대와 경과 시간의 기준) */
    public long startedAtMillis() {
        return (startedAtSeconds != null ? startedAtSeconds : updatedAtSeconds) * 1000;
    }

    /** 건조기가 종료 예상 시각을 알고 있는지 */
    public boolean hasEndsAt() {
        return endsAtSeconds != null && !KIND_WASHER.equals(kind);
    }

    /** `endsAt`이 이미 지난 가동 중 상태. 알림은 카운트다운 대신 "곧 끝나요"를 보여준다 */
    public boolean isOverdue(long nowMillis) {
        return hasEndsAt() && endsAtSeconds * 1000 <= nowMillis;
    }

    /**
     * `startedAt`~`endsAt` 구간에서 지금까지 진행한 비율(0~100).
     * 구간을 알 수 없으면 -1이다(막대를 indeterminate로 그린다).
     */
    public int progressPercent(long nowMillis) {
        if (!hasEndsAt()) return -1;

        long start = startedAtMillis();
        long end = endsAtSeconds * 1000;
        if (end <= start) return -1;

        long percent = Math.round(100.0 * (nowMillis - start) / (end - start));

        return (int) Math.max(0, Math.min(100, percent));
    }

    private static String nonEmpty(String value) {
        return value == null || value.isEmpty() ? null : value;
    }

    private static Long parseLong(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
