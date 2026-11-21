package me.gistory.bbosong.liveupdate;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import java.util.HashMap;
import java.util.Map;

/**
 * 디버그 빌드 전용. FCM 없이 서버 `LIVE_UPDATE` data 메시지와 같은 내용을 흉내 낸다.
 *
 * <pre>
 * adb shell am broadcast -a me.gistory.bbosong.DEBUG_LIVE_UPDATE -p me.gistory.bbosong \
 *   --es machineUuid m1 --es kind DRYER --es title "A동 건조기 3번" --es state RUNNING \
 *   --es startedAgoSec 600 --es endsInSec 1800
 * </pre>
 *
 * `startedAgoSec`/`endsInSec`은 지금 기준 상대값을 epoch 초로 바꿔 주는 편의 키다. 나머지 키는 서버 data와 같다.
 */
public class LiveUpdateDebugReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras == null) return;

        Map<String, String> data = new HashMap<>();
        data.put("type", LiveUpdateMessage.TYPE);
        long nowSeconds = System.currentTimeMillis() / 1000;
        data.put("updatedAt", Long.toString(nowSeconds));
        for (String key : extras.keySet()) {
            Object value = extras.get(key);
            if (value != null) data.put(key, value.toString());
        }
        if (data.containsKey("startedAgoSec")) {
            data.put("startedAt", Long.toString(nowSeconds - Long.parseLong(data.get("startedAgoSec"))));
        }
        if (data.containsKey("endsInSec")) {
            data.put("endsAt", Long.toString(nowSeconds + Long.parseLong(data.get("endsInSec"))));
        }

        LiveUpdateMessage message = LiveUpdateMessage.fromData(data);
        android.util.Log.d("LiveUpdateDebug", "data=" + data + " message=" + message + " supported=" + LiveUpdateNotifier.isSupported(context));
        if (message != null) LiveUpdateNotifier.show(context, message, true);
    }
}
