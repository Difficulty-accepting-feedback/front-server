export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type FetchOptions<B = unknown> = {
    method?: HttpMethod;
    body?: B;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    cache?: RequestCache;
};

export type RsData<T = any> = { code: string; msg?: string; message?: string; data: T };

export async function apiFetch<TData = any, TBody = unknown>(
    baseUrl: string,
    path: string,
    { method = 'GET', body, headers, signal, cache = 'no-store' }: FetchOptions<TBody> = {},
): Promise<TData> {
    const h = new Headers(headers ?? {});
    const hasBody = typeof body !== 'undefined';
    if (hasBody && !h.has('Content-Type')) h.set('Content-Type', 'application/json');

    const res = await fetch(`${baseUrl}${path}`, {
        method,
        signal,
        headers: h,                // ✅ 절대 X-Authorization-Id 넣지 않음
        body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body),
        credentials: 'include',    // ✅ 게이트웨이가 쿠키로 인증
        cache,
    });

    if (!res.ok) {
        let errText = res.statusText;
        try {
            const e = await res.json();
            errText = (e?.message || e?.msg || JSON.stringify(e)) ?? errText;
        } catch { /* noop */ }
        throw new Error(`${method} ${path} 실패: ${errText}`);
    }

    const json = (await res.json()) as RsData<TData> | TData;
    // RsData 래퍼/직접 데이터 모두 대응
    if (json && typeof json === 'object' && 'data' in (json as any)) {
        return (json as RsData<TData>).data;
    }
    return json as TData;
}