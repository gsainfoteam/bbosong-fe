package me.gistory.bbosong.liveupdate;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.StatusBarNotification;
import android.text.format.DateFormat;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationManagerCompat;
import java.util.Collections;
import java.util.Date;
import me.gistory.bbosong.R;

/**
 * 사용 중인 세탁기/건조기를 Android 16 Live Update(승격된 진행 알림)로 게시한다.
 *
 * - 승격은 API가 아니라 알림의 성격으로 결정된다. 진행 중(ongoing)이고 제목이 있으며 기본 스타일이나 `ProgressStyle`을 쓰는
 *   알림이 승격 대상이고, 사용자가 설정에서 `POST_PROMOTED_NOTIFICATIONS`를 끄면 일반 진행 알림으로 보인다.
 * - 디자인(DsLive)에 맞춰 종료 시각을 아는 기계만 진행 막대(`ProgressStyle`)를 쓴다. 건조기는 ThinQ, 세탁기는 사용자가 입력한
 *   남은 시간이 종료 시각이다. 세탁기를 입력 전이거나 시간 계산 중일 때는 막대 없이 기본 스타일로 두고 경과 시간을 보여준다.
 * - 종료 시각이 지나면 서버가 한 번 더 보내는 메시지(`endsAt` 이후)로 카운트다운을 접는다. 건조기는 "곧 끝나요"를 보여주고,
 *   세탁기는 입력한 값이 예상치라 더 돌 수 있으므로 "세탁 중"과 경과 시간으로 둔다. 앱은 그 시각에 스스로 알림을 갱신하지 않는다.
 * - 색은 기기를 따른다. 세탁기는 하늘, 건조기는 주황이고 오류는 회색이다.
 * - 기계마다 알림 하나를 `machineUuid`를 tag로 갱신한다. 같은 메시지가 여러 번 와도 결과는 같다(멱등).
 * - 가동 중에는 소리 없는 진행 알림, 종료/오류에는 별도 알림을 알림음과 함께 한 번 보낸다.
 *   서버가 Live Update를 지원하는 기기에는 일반 완료 푸시를 보내지 않으므로 이 알림이 완료 알림 역할을 한다.
 * - API 36 미만에서는 아무것도 하지 않는다(서버도 그런 기기에는 `supportsLiveUpdate=false`로 등록되어 있다).
 */
public final class LiveUpdateNotifier {

    /** Live Update를 쓸 수 있는 최소 API. `Build.VERSION_CODES.BAKLAVA`(Android 16) */
    static final int MIN_SDK = 36;

    static final String CHANNEL_PROGRESS = "live-update";
    /** `src/common/lib/native-push.ts`의 `NATIVE_PUSH_ANDROID_CHANNEL_ID`와 같아야 한다 */
    static final String CHANNEL_ALERT = "default";

    private static final int ID_PROGRESS = 0x4c55;
    private static final int ID_DONE = 0x4c56;
    private static final String DONE_TAG_SUFFIX = ":done";
    private static final String PREFS = "live-update-state";
    private static final String EXTRA_REQUEST_PROMOTED_ONGOING = "android.requestPromotedOngoing";
    private static final String EXTRA_SHORT_CRITICAL_TEXT = "android.shortCriticalText";
    private static final String EXTRA_KIND = "me.gistory.bbosong.liveupdate.KIND";
    private static final String EXTRA_TITLE = "me.gistory.bbosong.liveupdate.TITLE";
    private static final String EXTRA_STARTED_AT = "me.gistory.bbosong.liveupdate.STARTED_AT";

    private LiveUpdateNotifier() {}

    /** Android 16 이상이고 알림이 꺼져 있지 않은지 */
    public static boolean isSupported(Context context) {
        return (
            Build.VERSION.SDK_INT >= MIN_SDK &&
            NotificationManagerCompat.from(context).areNotificationsEnabled()
        );
    }

    /**
     * 서버(FCM)나 앱이 받은 내용을 알림에 반영한다.
     *
     * @param fromServer 서버 메시지인지. 앱이 포그라운드에서 보정 용도로 호출한 `END`는 진행 알림이 있을 때만
     *     완료 알림으로 바꾼다(앱을 열 때마다 알림음이 울리면 안 된다).
     */
    public static void show(Context context, LiveUpdateMessage message, boolean fromServer) {
        if (!isSupported(context)) return;

        Context app = context.getApplicationContext();
        NotificationManager manager = app.getSystemService(NotificationManager.class);
        long now = System.currentTimeMillis();

        // FCM은 순서를 보장하지 않는다. 이미 반영한 것보다 오래된 서버 메시지는 알림이 사라진 뒤에도 무시한다
        SharedPreferences prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (fromServer) {
            if (message.updatedAtSeconds < prefs.getLong(message.machineUuid + ".updatedAt", Long.MIN_VALUE)) return;
            prefs.edit().putLong(message.machineUuid + ".updatedAt", message.updatedAtSeconds).apply();
        }

        if (message.isFinished()) {
            boolean hadProgress = findActive(manager, message.machineUuid, ID_PROGRESS) != null;
            // 추적 해제: 사용 시작 시각 없이 END가 온다. 완료가 아니므로 알림을 지운다
            if (fromServer && LiveUpdateMessage.STATE_END.equals(message.state) && message.startedAtSeconds == null) {
                cancel(app, message.machineUuid);
                return;
            }
            if (!fromServer && !hadProgress) return;

            postDone(app, manager, message, now);
            return;
        }

        // 같은 기계를 다시 쓰기 시작했다면 이전 "완료" 알림은 치운다
        manager.cancel(message.machineUuid + DONE_TAG_SUFFIX, ID_DONE);
        postProgress(app, manager, message, now);
    }

    /** 앱이 가진 시작 시각·제목으로, 진행 알림이 있을 때만 내용을 갱신한다(`LiveActivity.update`) */
    public static void update(Context context, LiveUpdateMessage message) {
        NotificationManager manager = context.getApplicationContext().getSystemService(NotificationManager.class);
        // 없는 알림을 갱신하려 해도 성공으로 본다(iOS와 같다)
        if (findActive(manager, message.machineUuid, ID_PROGRESS) == null) return;

        show(context, message, false);
    }

    /** 이 기계의 진행/완료 알림을 모두 지운다 */
    public static void cancel(Context context, String machineUuid) {
        NotificationManager manager = context.getApplicationContext().getSystemService(NotificationManager.class);
        manager.cancel(machineUuid, ID_PROGRESS);
        manager.cancel(machineUuid + DONE_TAG_SUFFIX, ID_DONE);
    }

    /** 현재 떠 있는 진행 알림이 가진 제목/종류/시작 시각. 앱의 `update`가 이어서 쓴다 */
    public static LiveUpdateMessage withActiveDetails(Context context, LiveUpdateMessage partial) {
        NotificationManager manager = context.getApplicationContext().getSystemService(NotificationManager.class);
        StatusBarNotification active = findActive(manager, partial.machineUuid, ID_PROGRESS);
        if (active == null) return partial;

        Bundle extras = active.getNotification().extras;
        Long startedAt = partial.startedAtSeconds;
        if (startedAt == null && extras.containsKey(EXTRA_STARTED_AT)) {
            startedAt = extras.getLong(EXTRA_STARTED_AT);
        }

        return new LiveUpdateMessage(
            partial.machineUuid,
            extras.getString(EXTRA_KIND, partial.kind),
            extras.getString(EXTRA_TITLE, partial.title),
            partial.state,
            partial.updatedAtSeconds,
            startedAt,
            partial.endsAtSeconds
        );
    }

    private static StatusBarNotification findActive(NotificationManager manager, String tag, int id) {
        for (StatusBarNotification sbn : manager.getActiveNotifications()) {
            if (sbn.getId() == id && tag.equals(sbn.getTag())) return sbn;
        }

        return null;
    }

    private static void ensureChannels(Context context, NotificationManager manager) {
        if (manager.getNotificationChannel(CHANNEL_PROGRESS) == null) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_PROGRESS,
                context.getString(R.string.live_update_channel_name),
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setShowBadge(false);
            manager.createNotificationChannel(channel);
        }
        // 앱 시작 시 JS가 만드는 채널과 같은 ID. 앱이 한 번도 열리지 않았어도 알림음이 나도록 보장한다
        if (manager.getNotificationChannel(CHANNEL_ALERT) == null) {
            manager.createNotificationChannel(
                new NotificationChannel(
                    CHANNEL_ALERT,
                    context.getString(R.string.app_name),
                    NotificationManager.IMPORTANCE_HIGH
                )
            );
        }
    }

    private static PendingIntent contentIntent(Context context) {
        Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launch == null) launch = new Intent();
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        return PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    /** 세탁기는 하늘, 건조기는 주황, 오류는 회색. 알림 아이콘 색과 진행 막대에 쓴다 */
    private static int kindColor(Context context, LiveUpdateMessage message) {
        if (LiveUpdateMessage.STATE_ERROR.equals(message.state)) return context.getColor(R.color.live_update_off);

        return context.getColor(
            LiveUpdateMessage.KIND_WASHER.equals(message.kind) ? R.color.live_update_washer : R.color.live_update_dryer
        );
    }

    /** "건조 중 · 22:21 종료". 종료 시각을 모르면 상태 이름만 돌려준다 */
    private static String stateWithEnd(Context context, int stateRes, LiveUpdateMessage message) {
        String state = context.getString(stateRes);
        if (!message.hasEndsAt()) return state;

        String time = DateFormat.getTimeFormat(context).format(new Date(message.endsAtSeconds * 1000));

        return context.getString(R.string.live_update_state_with_end, state, time);
    }

    /** 알림 본문(제목 아래 줄). 시간이 흐르는 것은 칩/카운트다운이 맡으므로 상태와 종료 시각만 적는다 */
    private static String stateText(Context context, LiveUpdateMessage message, boolean overdue) {
        if (LiveUpdateMessage.KIND_WASHER.equals(message.kind)) {
            // 입력한 종료 시각은 예상치라 지난 뒤에도 더 돌 수 있다. 끝난다고 단정하지 않고 경과 시간과 함께 "세탁 중"으로 둔다
            return overdue
                ? context.getString(R.string.live_update_washing)
                : stateWithEnd(context, R.string.live_update_washing, message);
        }

        switch (message.state) {
            case LiveUpdateMessage.STATE_COOLING:
                return stateWithEnd(context, R.string.live_update_cooling, message);
            case LiveUpdateMessage.STATE_PAUSE:
                return context.getString(R.string.live_update_paused);
            case LiveUpdateMessage.STATE_DETECTING:
                return context.getString(R.string.live_update_just_started);
            default:
                if (overdue) return context.getString(R.string.live_update_almost_done);
                return message.hasEndsAt()
                    ? stateWithEnd(context, R.string.live_update_drying, message)
                    : context.getString(R.string.live_update_just_started);
        }
    }

    /**
     * 상태바 칩에 들어가는 짧은 문구. 시간이 흐르는 상태는 `null`을 돌려주어 시스템 타이머가 칩에 보이게 한다.
     * (남은 시간을 문자열로 넣으면 게시 시점 값으로 굳어 버린다)
     *
     * - 종료 시각을 아는 가동: 남은 시간 카운트다운이, 세탁기를 입력 전에는 경과 시간이 칩에 보인다.
     * - 일시정지·시간 계산 중·(건조기가) 곧 끝남: 시간이 의미 없으므로 문구를 보여준다.
     */
    private static String shortText(Context context, LiveUpdateMessage message, boolean overdue) {
        if (LiveUpdateMessage.KIND_WASHER.equals(message.kind)) {
            return null;
        }

        // `stateText`와 같은 우선순위: 냉각/일시정지/계산 중이 지연 판단보다 먼저다
        switch (message.state) {
            case LiveUpdateMessage.STATE_COOLING:
                return message.hasEndsAt() && !overdue ? null : context.getString(R.string.live_update_cooling);
            case LiveUpdateMessage.STATE_PAUSE:
                return context.getString(R.string.live_update_paused);
            case LiveUpdateMessage.STATE_DETECTING:
                return context.getString(R.string.live_update_calculating);
            default:
                break;
        }

        if (overdue) return context.getString(R.string.live_update_almost_done);
        if (message.hasEndsAt()) return null;

        return context.getString(R.string.live_update_calculating);
    }

    @RequiresApi(MIN_SDK)
    private static void postProgress(
        Context context,
        NotificationManager manager,
        LiveUpdateMessage message,
        long now
    ) {
        ensureChannels(context, manager);

        boolean washer = LiveUpdateMessage.KIND_WASHER.equals(message.kind);
        boolean paused = LiveUpdateMessage.STATE_PAUSE.equals(message.state);
        boolean detecting = LiveUpdateMessage.STATE_DETECTING.equals(message.state);
        boolean overdue = message.isOverdue(now);

        Bundle extras = new Bundle();
        extras.putString(EXTRA_KIND, message.kind);
        extras.putString(EXTRA_TITLE, message.title);
        extras.putLong(EXTRA_STARTED_AT, message.startedAtMillis() / 1000);
        // API 36.1+의 `Builder.setRequestPromotedOngoing(true)`와 같다. compileSdk 36에는 상수가 없어 키를 직접 쓴다
        extras.putBoolean(EXTRA_REQUEST_PROMOTED_ONGOING, true);
        // 상태바 칩과 삼성 Now Bar(접힌 상태)에 표시되는 짧은 문구. 건조 중 남은 시간은 비워 두어 카운트다운을 쓴다
        String shortText = shortText(context, message, overdue);
        if (shortText != null) extras.putCharSequence(EXTRA_SHORT_CRITICAL_TEXT, shortText);

        Notification.Builder builder = new Notification.Builder(context, CHANNEL_PROGRESS)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setColor(kindColor(context, message))
            // 삼성 One UI는 카운트다운을 제목 바로 뒤에 붙여 그려서, 잘리지 않는 공백(NBSP)으로 띄운다
            .setContentTitle(message.title + "\u00A0")
            .setContentText(stateText(context, message, overdue))
            .setContentIntent(contentIntent(context))
            .setCategory(Notification.CATEGORY_PROGRESS)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .addExtras(extras);

        if (message.hasEndsAt() && !paused && !detecting && !overdue) {
            builder
                .setWhen(message.endsAtSeconds * 1000)
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setChronometerCountDown(true);
        } else if (washer) {
            // 입력 전이거나 입력한 종료 시각이 지난 세탁기는 경과 시간을 보여준다
            builder.setWhen(message.startedAtMillis()).setShowWhen(true).setUsesChronometer(true);
        } else {
            builder.setShowWhen(false);
        }

        // 진행 막대는 종료 시각을 알아 구간이 정해질 때만 둔다. 세탁기 입력 전·시간 계산 중에는 막대 없이 기본 스타일을 쓴다
        // 세탁기는 예상 시각이 지나도 더 돌 수 있어 가득 찬 막대를 두지 않는다(막대 없이 경과 시간만 보여준다)
        int percent = overdue ? (washer ? -1 : 100) : message.progressPercent(now);
        if (!detecting && percent >= 0) {
            int color = kindColor(context, message);
            // 일시정지 중에는 멈춘 채 흐리게 둔다
            int barColor = paused ? Color.argb(115, Color.red(color), Color.green(color), Color.blue(color)) : color;
            Notification.ProgressStyle style = new Notification.ProgressStyle();
            style.setProgressSegments(
                Collections.singletonList(new Notification.ProgressStyle.Segment(100).setColor(barColor))
            );
            style.setProgress(percent);
            // 투명한 끝 아이콘 자리만큼 막대 오른쪽 끝을 안쪽으로 들인다
            style.setProgressEndIcon(Icon.createWithBitmap(Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)));
            builder.setStyle(style);
        }

        manager.notify(message.machineUuid, ID_PROGRESS, builder.build());
    }

    private static void postDone(
        Context context,
        NotificationManager manager,
        LiveUpdateMessage message,
        long now
    ) {
        // 같은 가동의 같은 종료 이벤트가 재전송되면(완료 알림을 이미 치웠어도) 다시 울리지 않는다
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String doneKey = message.state + ":" + message.startedAtMillis() / 1000;
        if (doneKey.equals(prefs.getString(message.machineUuid + ".done", null))) {
            // 알림음은 생략하되, 그 사이 다시 게시된 진행 알림이 남지 않게 치운다
            // 같은 가동(startedAt 일치)의 알림만 치운다. 이미 시작된 새 가동의 알림은 둔다
            StatusBarNotification active = findActive(manager, message.machineUuid, ID_PROGRESS);
            if (
                active != null &&
                active.getNotification().extras.getLong(EXTRA_STARTED_AT, Long.MIN_VALUE) ==
                message.startedAtMillis() / 1000
            ) {
                manager.cancel(message.machineUuid, ID_PROGRESS);
            }
            return;
        }
        prefs.edit().putString(message.machineUuid + ".done", doneKey).apply();

        ensureChannels(context, manager);

        boolean washer = LiveUpdateMessage.KIND_WASHER.equals(message.kind);
        boolean error = LiveUpdateMessage.STATE_ERROR.equals(message.state);
        // 앱에 남은 제목이 없으면(앱이 종료된 채 END만 온 경우) 메시지의 제목을 쓴다
        LiveUpdateMessage details = withActiveDetails(context, message);
        // 끝났을 때는 제목 자리에 상태 문장이, 본문에 기기 이름(꺼내 달라는 안내)이 온다. 오류는 본문에 기기 이름만 둔다
        String headline = error
            ? context.getString(R.string.live_update_error)
            : context.getString(washer ? R.string.live_update_washer_done : R.string.live_update_dryer_done);
        String text = error ? details.title : context.getString(R.string.live_update_take_out, details.title);

        manager.cancel(message.machineUuid, ID_PROGRESS);
        // 같은 tag/id로 다시 와도(서버 재전송) 알림음은 한 번만 울린다
        manager.notify(
            message.machineUuid + DONE_TAG_SUFFIX,
            ID_DONE,
            new Notification.Builder(context, CHANNEL_ALERT)
                .setSmallIcon(R.drawable.ic_stat_notification)
                .setColor(kindColor(context, message))
                .setContentTitle(headline)
                .setContentText(text)
                .setContentIntent(contentIntent(context))
                .setCategory(Notification.CATEGORY_STATUS)
                .setAutoCancel(true)
                .setOnlyAlertOnce(true)
                .setWhen(now)
                .setShowWhen(true)
                .build()
        );
    }
}
