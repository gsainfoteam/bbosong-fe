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
  plugins: {
    // fetch/XHR을 네이티브 HTTP로 처리한다.
    // 앱 Origin(capacitor://localhost, https://localhost)은 서버 CORS 허용 목록에 없고,
    // refresh 쿠키가 크로스 사이트 쿠키로 차단되는 문제를 함께 피한다.
    CapacitorHttp: { enabled: true },
  },
};

export default config;
