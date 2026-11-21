import Capacitor

/// npm으로 설치하지 않은 앱 내 플러그인은 브릿지가 자동으로 찾지 못하므로 여기서 직접 등록한다
class AppViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(LiveActivityPlugin())
    }
}
