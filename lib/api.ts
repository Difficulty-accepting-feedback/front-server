export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// API 서버의 기본 URL
const API_BASE = 'http://localhost:8080';

// 임시 사용자 ID (실제 환경에서는 인증 토큰이나 세션에서 가져와야 함)
const MEMBER_ID = '2';

// Fetch 요청 옵션 타입 정의
type FetchOptions<B = any> = {
    method?: HttpMethod;
    body?: B;
    headers?: Record<string, string>;
    signal?: AbortSignal;
};

// 서버에서 반환하는 RsData 타입 정의
type RsData<T = any> = {
    code: string;
    msg: string;
    data: T;
};

/**
 * API 요청을 처리하는 공통 함수
 * - GET 요청: RsData의 data 필드만 반환
 * - POST/PUT/DELETE: 전체 RsData 객체 반환
 *
 * @param path - API 엔드포인트 경로
 * @param options - 요청 옵션 (method, body, headers 등)
 * @returns GET일 경우 data만, 나머지는 전체 RsData 반환
 */
export async function apiFetch<TData = any, TBody = any>(
    path: string,
    { method = 'GET', body, headers, signal }: FetchOptions<TBody> = {},
): Promise<'GET' extends typeof method ? TData : RsData<TData>> {

    // HTTP 요청 실행
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        signal,
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Id': MEMBER_ID, // 사용자 인증 ID를 헤더에 추가
            ...headers,
        },
        // GET과 DELETE는 body가 없으므로 undefined, 나머지는 JSON 문자열로 변환
        body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body),
        credentials: 'include', // 쿠키 포함하여 요청
    });

    // 응답이 실패한 경우 에러 처리
    if (!res.ok) {
        let errText: string;
        try {
            const e = await res.json();
            errText = typeof e?.message === 'string' ? e.message : JSON.stringify(e);
        } catch {
            errText = res.statusText;
        }

        throw new Error(`API ${method} ${path} failed: ${errText}`);
    }

    // 응답을 RsData 형태로 파싱
    const rsData = (await res.json()) as RsData<TData>;

    // GET 요청의 경우 data 필드만 반환, 나머지는 전체 RsData 반환
    if (method === 'GET') {
        return rsData.data as any; // GET일 경우 data만 반환
    } else {
        return rsData as any; // POST/PUT/DELETE일 경우 전체 RsData 반환
    }
}