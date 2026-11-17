import { type CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.gistory.bbosong',
  appName: '뽀송',
  webDir: 'dist',
  plugins: {
    // fetch/XHR을 네이티브 HTTP로 처리한다.
    // 앱 Origin(capacitor://localhost, https://localhost)은 서버 CORS 허용 목록에 없고,
    // refresh 쿠키가 크로스 사이트 쿠키로 차단되는 문제를 함께 피한다.
    CapacitorHttp: { enabled: true },
  },
};

export default config;
