# BBOSONG FE

기숙사 세탁실 현황 확인 사이트

## 개발 환경 설정

### 필수 요구사항

- [Bun](https://bun.sh/) (패키지 매니저)
- Node.js (Bun과 함께 설치됨)

### 환경 변수 설정

`.env` 파일에 다음 환경 변수들이 필요합니다:

- `VITE_IDP_CLIENT_ID`
- `VITE_IDP_REDIRECT_URI`
- `VITE_IDP_AUTHORIZE_URL`
- `VITE_IDP_TOKEN_URL`
- `VITE_API_BASE_URL`
- `VITE_VAPID_PUBLIC_KEY`
- `SWAGGER_URL`
- `SWAGGER_USER`
- `SWAGGER_PASSWORD`

자세한 내용은 `.env.example` 파일과 Notion, Infisical을 참고해주세요.

## 시작하기

### 설치

```bash
bun install
```

### 개발 서버 실행

```bash
bun run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
bun run build
```

### 코드 품질 관리

```bash
# 린트 검사
bun run lint

# 포맷팅
bun run format

# 린트 검사 및 포맷팅 자동 수정
bun run check
```

### 테스트

```bash
bun run test
```

### Storybook

```bash
# Storybook 개발 서버 실행
bun run storybook

# Storybook 빌드
bun run build-storybook
```

## 백엔드 API

이 프로젝트는 [openapi-typescript](https://openapi-ts.dev/), [openapi-fetch](https://openapi-ts.dev/openapi-fetch/), [openapi-react-query](https://openapi-ts.dev/openapi-react-query/)를 사용하여 백엔드 API를 type-safe하게 사용합니다.

### API 스키마 생성

백엔드의 OpenAPI 스키마를 기반으로 TypeScript 타입을 자동 생성합니다:

```bash
bun run gen:api
```

이 명령어는 백엔드의 Swagger JSON을 다운로드하여 `src/@types/api-schema.ts` 파일을 생성합니다. 빌드 시 자동으로 실행됩니다.

## i18n (국제화)

이 프로젝트는 [i18next](https://www.i18next.com/)와 [i18next-cli](https://github.com/i18next/i18next-cli)를 사용하여 다국어를 지원합니다.

### 주요 명령어

```bash
# 번역 키 추출 (개발 중 watch 권장)
bun run i18n:extract --watch

# Typescript 타입 생성 (개발 중 watch 권장)
bun run i18n:types --watch

# 둘을 동시에 실행하는 법 (Unix 환경에서만 작동함)
bun run gen:i18n

# 번역 상태 확인
bun run i18n:status

# 언어 파일 동기화
bun run i18n:sync

# 하드코딩된 문자열 검사
bun run i18n:lint
```

### 사용법

- 번역 파일: `public/locales/{language}/{namespace}.json`
- 코드에서 사용: `useTranslation('namespace')`로 네임스페이스 지정 후 `t('key')` 사용
- 개발 중에는 `bun run gen:i18n`을 실행하여 번역 키 추출과 TypeScript 타입 생성을 동시에 watch 모드로 실행

## Barrel 파일

이 프로젝트는 [barrelsby](https://github.com/bencoveney/barrelsby)를 사용하여 디렉터리별 `index.ts`(barrel 파일)를 자동 생성합니다.

계층 내부의 세부 파일에 직접 접근하지 않고 각 디렉터리의 `index.ts`를 통해서만 import하도록 ESLint(`no-restricted-imports`)로 강제하고 있습니다.

### 주요 명령어

```bash
# barrel 파일 생성 및 갱신
bun run gen:barrel
```

### 설정

생성 대상 디렉터리와 옵션은 `barrelsby.config.json`에 정의되어 있습니다.

- `directory`: barrel을 생성할 디렉터리 목록
- `delete`: 기존 barrel 파일을 삭제한 뒤 새로 생성
- `location: replace`: 각 디렉터리의 `index.ts`를 대체
- `exclude`: `*.test.ts`, `*.stories.tsx`는 export 대상에서 제외

### 사용법

- 파일을 추가/삭제/이름 변경한 뒤에는 `bun run gen:barrel`을 실행하여 barrel 파일을 갱신
- 새로운 디렉터리를 만들었다면 `barrelsby.config.json`의 `directory`에 경로를 추가
- `models/`처럼 `directory` 목록에 없는 디렉터리의 `index.ts`는 직접 관리
- import 예시: `import { Button } from '@/common/components'`, `import { useAuth } from '@/features/auth'`
