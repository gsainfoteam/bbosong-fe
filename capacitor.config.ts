import { type CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.gistory.bbosong',
  appName: '뽀송',
  webDir: 'dist',
  ios: {
    // 기본값(never)은 WebView가 상태바/홈 인디케이터 뒤까지 그려져 헤더 탭이 상태바에 가려진다
    contentInset: 'always',
    // safe area 바깥(상태바/홈 인디케이터 뒤)에 보이는 색. styles.css의 --color-bg와 맞춘다
    backgroundColor: '#f7f8fa',
  },
  experimental: {
    ios: {
      spm: {
        // @capacitor-firebase/messaging과 Firebase SDK의 SwiftPM 패키지 ID 충돌을 피한다
        packageOptions: {
          '@capacitor-firebase/messaging': { symlink: true },
        },
      },
    },
  },
  plugins: {
    // fetch/XHR을 네이티브 HTTP로 처리한다.
    // 앱 Origin(capacitor://localhost, https://localhost)은 서버 CORS 허용 목록에 없고,
    // refresh 쿠키가 크로스 사이트 쿠키로 차단되는 문제를 함께 피한다.
    CapacitorHttp: { enabled: true },
    // OTA는 웹 호스트의 latest.json을 직접 조회한다(native-update.ts). Capgo 클라우드 통신은 모두 끈다.
    // 새 번들이 시작 후 notifyAppReady()를 호출하지 못하면 플러그인이 이전 번들로 자동 롤백한다
    CapacitorUpdater: { autoUpdate: false, statsUrl: '' },
    // iOS: 앱이 포그라운드여도 시스템 배너(head-up)와 소리를 띄운다. 서버가 badge를 보내지 않으므로 badge는 뺀다.
    // Android는 FCM이 포그라운드 알림을 만들지 않아 native-push.ts가 로컬 알림으로 대신 띄운다.
    // 앱 화면 갱신은 두 플랫폼 모두 notificationReceived로 처리한다
    FirebaseMessaging: { presentationOptions: ['alert', 'sound'] },
    // Android 포그라운드 로컬 알림의 상태바 아이콘. 지정하지 않으면 시스템 기본 아이콘이 쓰인다.
    // 원격 알림용 아이콘(AndroidManifest의 default_notification_icon)과 같은 리소스를 쓴다
    LocalNotifications: { smallIcon: 'ic_stat_notification', iconColor: '#4F7DF3' },
    // 웹 앱이 준비될 때까지 스플래시를 유지한다. 숨기는 시점은 app.tsx의 SessionRouter에서 제어한다
    SplashScreen: { launchAutoHide: false, backgroundColor: '#ffffff' },
  },
};

export default config;
