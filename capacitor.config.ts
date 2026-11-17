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
    // 웹 앱이 준비될 때까지 스플래시를 유지한다. 숨기는 시점은 app.tsx의 SessionRouter에서 제어한다
    SplashScreen: { launchAutoHide: false, backgroundColor: '#ffffff' },
  },
};

export default config;
