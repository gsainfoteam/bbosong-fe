import createFetchClient, { type MaybeOptionalInit, type Middleware } from 'openapi-fetch';
import createQueryClient from 'openapi-react-query';

import { ApiPaths, type paths } from '@/@types/api-schema';
import { useToken } from '@/features/auth';

let refreshPromise: ReturnType<
  typeof api.POST<
    ApiPaths.AuthController_refresh,
    MaybeOptionalInit<paths[ApiPaths.AuthController_refresh], 'post'>
  >
> | null = null;

const middleware: Middleware = {
  async onRequest({ request }) {
    const token = useToken.getState().token;
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    }

    // 자체 로그인 토큰이 없고 OIDC IDP 토큰이 활성화되어 있으면 Authorization 헤더 탑재
    const idpToken = useToken.getState().idpToken;
    if (idpToken) {
      request.headers.set('Authorization', `Bearer ${idpToken}`);
    }

    return request;
  },
  async onResponse({ request, response, options }) {
    if (response.status === 401) {
      // 리프레시 자체 요청 및 재시도 요청은 통과
      if (request.headers.has('x-retry') || request.url.includes(ApiPaths.AuthController_refresh)) {
        return response;
      }

      // 동시 호출 401 대처용 Promise 락 구성
      refreshPromise ??= api
        .POST(ApiPaths.AuthController_refresh)
        .finally(() => (refreshPromise = null));

      try {
        const { data } = await refreshPromise;

        if (data) {
          const newToken = data.access_token;
          useToken.getState().saveToken(newToken);

          // 헤더 복제 및 set 메소드를 이용해 Authorization을 새 Bearer 토큰으로 덮어씀
          const headers = new Headers(request.headers);
          headers.set('Authorization', `Bearer ${newToken}`);
          headers.set('x-retry', 'true');

          const retryRequest = new Request(request, { headers });

          return options.fetch(retryRequest);
        } else {
          useToken.getState().saveToken(null);
          return response;
        }
      } catch {
        // 리프레시 갱신 도중 발생한 예외 포획 시 토큰을 비우고 원래 401 응답 반환
        useToken.getState().saveToken(null);
        return response;
      }
    }
  },
};

export const api = createFetchClient<paths>({
  baseUrl: import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL,
  credentials: 'include',
});
api.use(middleware);

export const $api = createQueryClient(api);
