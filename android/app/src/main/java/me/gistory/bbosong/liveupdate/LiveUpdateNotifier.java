package me.gistory.bbosong.liveupdate;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.StatusBarNotification;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationManagerCompat;
import java.util.Collections;
import me.gistory.bbosong.R;

/**
 * 사용 중인 세탁기/건조기를 Android 16 Live Update(승격된 진행 알림)로 게시한다.
 *
 * - 승격은 API가 아니라 알림의 성격으로 결정된다. 진행 중(ongoing)이고 제목이 있으며 `ProgressStyle`을 쓰는 알림이
 *   승격 대상이고, 사용자가 설정에서 `POST_PROMOTED_NOTIFICATIONS`를 끄면 일반 진행 알림으로 보인다.
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

    private static String stateText(Context context, LiveUpdateMessage message, boolean overdue) {
        boolean washer = LiveUpdateMessage.KIND_WASHER.equals(message.kind);
        if (washer) return context.getString(R.string.live_update_washing);

        switch (message.state) {
            case LiveUpdateMessage.STATE_COOLING:
                return context.getString(R.string.live_update_cooling);
            case LiveUpdateMessage.STATE_PAUSE:
                return context.getString(R.string.live_update_paused);
            case LiveUpdateMessage.STATE_DETECTING:
                return context.getString(R.string.live_update_calculating);
            default:
                if (overdue) return context.getString(R.string.live_update_almost_done);
                return message.hasEndsAt()
                    ? context.getString(R.string.live_update_drying)
                    : context.getString(R.string.live_update_calculating);
        }
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

        Notification.Builder builder = new Notification.Builder(context, CHANNEL_PROGRESS)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setColor(context.getColor(R.color.notification_color))
            .setContentTitle(message.title)
            .setContentText(stateText(context, message, overdue))
            .setContentIntent(contentIntent(context))
            .setCategory(Notification.CATEGORY_PROGRESS)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .addExtras(extras);

        if (washer) {
            // 세탁기는 남은 시간을 모른다. 경과 시간을 보여주고 막대는 indeterminate로 둔다
            builder.setWhen(message.startedAtMillis()).setShowWhen(true).setUsesChronometer(true);
        } else if (message.hasEndsAt() && !paused && !detecting && !overdue) {
            builder
                .setWhen(message.endsAtSeconds * 1000)
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setChronometerCountDown(true);
        } else {
            builder.setShowWhen(false);
        }

        int percent = overdue ? 100 : message.progressPercent(now);
        Notification.ProgressStyle style = new Notification.ProgressStyle();
        if (washer || detecting || percent < 0) {
            style.setProgressIndeterminate(true);
        } else {
            style.setProgressSegments(Collections.singletonList(new Notification.ProgressStyle.Segment(100)));
            style.setProgress(percent);
        }
        builder.setStyle(style);

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
        String text = LiveUpdateMessage.STATE_ERROR.equals(message.state)
            ? context.getString(R.string.live_update_error)
            : context.getString(washer ? R.string.live_update_washer_done : R.string.live_update_dryer_done);
        // 앱에 남은 제목이 없으면(앱이 종료된 채 END만 온 경우) 메시지의 제목을 쓴다
        LiveUpdateMessage details = withActiveDetails(context, message);

        manager.cancel(message.machineUuid, ID_PROGRESS);
        // 같은 tag/id로 다시 와도(서버 재전송) 알림음은 한 번만 울린다
        manager.notify(
            message.machineUuid + DONE_TAG_SUFFIX,
            ID_DONE,
            new Notification.Builder(context, CHANNEL_ALERT)
                .setSmallIcon(R.drawable.ic_stat_notification)
                .setColor(context.getColor(R.color.notification_color))
                .setContentTitle(details.title)
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
