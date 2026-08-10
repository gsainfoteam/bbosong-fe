import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { i18n } from './i18n';

import type { Language } from './languages';

dayjs.extend(localizedFormat);

const loaderMap: Record<Language, () => Promise<ILocale>> = {
  ko: () => import('dayjs/locale/ko'),
  en: () => import('dayjs/locale/en'),
};

const handleChangeLanguage = async (lng: Language) => {
  try {
    dayjs.locale(lng);

    const loader = loaderMap[lng];
    if (!loader) throw new Error(`Unsupported language: ${lng}`);

    if (lng !== 'en') {
      const locale = await loader();
      dayjs.locale(locale);
    }
  } catch {
    // 로케일 로드 실패 시 정적 임포트된 한국어로 동기식 대체
    dayjs.locale('ko');
  }
};

i18n.on('languageChanged', handleChangeLanguage);

// 최상위 스코프에서 직접 loader를 실행하여 로케일 초기화
const initLng = i18n.language as Language;
dayjs.locale(initLng);
const initLoader = loaderMap[initLng];
if (initLoader && initLng !== 'en') {
  try {
    const locale = await initLoader();
    dayjs.locale(locale);
  } catch {
    // 최상위 초기화 비동기 실패 시 한국어로 동기식 안전 복구
    dayjs.locale('ko');
  }
}
