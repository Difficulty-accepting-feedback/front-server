export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_BASE = 'http://localhost:8080';
const MEMBER_ID = '2';

type FetchOptions<B = unknown> = {
    method?: HttpMethod;
    body?: B;
    headers?: Record<string, string>;
    signal?: AbortSignal;
};

export async function apiFetch<TResp, B = unknown>(
    path: string,
    { method = 'GET', body, headers, signal }: FetchOptions<B> = {},
): Promise<TResp> {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        signal,
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Id': MEMBER_ID,
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
        throw new Error(`API ${method} ${path} failed: ${errText}`);
    }
    // RsData<T> 형태라면 필요 시 래핑 타입에 맞춰 파싱
    return (await res.json()) as TResp;
}
