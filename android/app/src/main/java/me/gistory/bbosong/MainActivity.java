package me.gistory.bbosong;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import me.gistory.bbosong.liveupdate.LiveActivityPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // super.onCreate보다 먼저 등록해야 브리지가 플러그인을 찾는다
        registerPlugin(LiveActivityPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
