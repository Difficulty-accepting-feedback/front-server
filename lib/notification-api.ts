import { NOTIFICATION_BASE_URL } from '@/lib/env';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const DEFAULT_MEMBER_ID = '2'; // 로컬 직결 테스트용 기본값 (게이트웨이 도입 전)

type FetchOptions<B = unknown> = {
    method?: HttpMethod;
    body?: B;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    memberId?: number | string; // 명시 전달 시 우선 사용
};

export async function notificationFetch<TResp, B = unknown>(
    path: string,
    { method = 'GET', body, headers, signal, memberId }: FetchOptions<B> = {},
): Promise<TResp> {
    const mid = memberId ?? DEFAULT_MEMBER_ID;

    const res = await fetch(`${NOTIFICATION_BASE_URL}${path}`, {
        method,
        signal,
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Id': String(mid),
            ...headers,
        },
        body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body),
        credentials: 'include',
    });

    if (!res.ok) {
        let errText: string;
        try {
            const e = await res.json();
            errText = typeof e?.message === 'string' ? e.message : JSON.stringify(e);
        } catch {
            errText = res.statusText;
        }
        throw new Error(`NOTIF ${method} ${path} failed: ${errText}`);
    }
    return (await res.json()) as TResp;
}