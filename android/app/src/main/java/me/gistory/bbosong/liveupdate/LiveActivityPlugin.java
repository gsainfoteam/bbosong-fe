package me.gistory.bbosong.liveupdate;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.HashMap;
import java.util.Map;

/**
 * iOS의 `LiveActivity` 플러그인과 같은 이름·같은 인터페이스(`src/common/lib/live-activity.ts`).
 *
 * Android에는 activity별 push token이 없으므로 `pushToken`/`activityEnded` 이벤트는 발생하지 않는다.
 * 서버가 보내는 갱신은 `LiveUpdateMessagingService`가 처리하고, 이 플러그인은 앱이 열려 있을 때의 시작·보정·종료를 맡는다.
 */
@CapacitorPlugin(name = "LiveActivity")
public class LiveActivityPlugin extends Plugin {

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject result = new JSObject();
        result.put("supported", LiveUpdateNotifier.isSupported(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        LiveUpdateMessage message = toMessage(call);
        if (message != null) LiveUpdateNotifier.show(getContext(), message, false);
        call.resolve();
    }

    @PluginMethod
    public void update(PluginCall call) {
        LiveUpdateMessage message = toMessage(call);
        if (message != null) {
            // 시작 때 정한 제목/종류/시작 시각은 떠 있는 알림에서 이어받는다
            LiveUpdateNotifier.update(getContext(), LiveUpdateNotifier.withActiveDetails(getContext(), message));
        }
        call.resolve();
    }

    @PluginMethod
    public void end(PluginCall call) {
        String machineUuid = call.getString("machineUuid");
        if (machineUuid != null) LiveUpdateNotifier.cancel(getContext(), machineUuid);
        call.resolve();
    }

    private static LiveUpdateMessage toMessage(PluginCall call) {
        Map<String, String> data = new HashMap<>();
        data.put("type", LiveUpdateMessage.TYPE);
        put(data, "machineUuid", call.getString("machineUuid"));
        put(data, "kind", call.getString("kind"));
        put(data, "title", call.getString("title"));
        put(data, "state", call.getString("state"));
        put(data, "updatedAt", number(call, "updatedAt"));
        put(data, "startedAt", number(call, "startedAt"));
        put(data, "endsAt", number(call, "endsAt"));

        return LiveUpdateMessage.fromData(data);
    }

    private static void put(Map<String, String> data, String key, String value) {
        if (value != null) data.put(key, value);
    }

    /** JS number(null 가능)를 정수 문자열로 바꾼다. 서버 data와 같은 규칙으로 null은 생략한다 */
    private static String number(PluginCall call, String key) {
        Double value = call.getDouble(key);

        return value == null ? null : Long.toString(value.longValue());
    }
}
