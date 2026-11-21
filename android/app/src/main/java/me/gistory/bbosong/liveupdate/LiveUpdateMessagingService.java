package me.gistory.bbosong.liveupdate;

import androidx.annotation.NonNull;
import com.google.firebase.messaging.RemoteMessage;
import io.capawesome.capacitorjs.plugins.firebase.messaging.MessagingService;

/**
 * 플러그인의 FCM 서비스를 대신해 등록되는 서비스.
 *
 * 서버의 `LIVE_UPDATE` data 메시지는 앱이 종료된 상태에서도 알림을 만들어야 하므로 JS가 아니라 여기서 처리한다.
 * 그 밖의 메시지는 플러그인이 하던 대로 그대로 넘긴다.
 */
public class LiveUpdateMessagingService extends MessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(remoteMessage.getData());
        if (message == null) {
            super.onMessageReceived(remoteMessage);
            return;
        }

        LiveUpdateNotifier.show(this, message, true);
    }
}
