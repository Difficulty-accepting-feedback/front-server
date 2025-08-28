'use client'
import { useQuery } from '@tanstack/react-query'

const MEMBER_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8081'

export type PointHistory = {
    pointHistoryId: number
    amount: number
    content: string
    addAt: string
    balanceAfter?: number
}

export type SpringPage<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
    first: boolean
    last: boolean
    empty: boolean
}

type RsPage<T> = { code?: string; message?: string; data?: SpringPage<T> }

export const EMPTY_PAGE: SpringPage<PointHistory> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 0,
    first: true,
    last: true,
    empty: true,
}

function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null
}

function pickError(body: unknown): { code?: string; message?: string } {
    if (!isObject(body)) return {}
    const rec = body as Record<string, unknown>
    const code =
        typeof rec.code === 'string' ? rec.code :
            typeof rec.errorCode === 'string' ? rec.errorCode :
                (typeof rec.status === 'string' || typeof rec.status === 'number') ? String(rec.status) :
                    undefined
    const message = typeof rec.message === 'string' ? rec.message : undefined
    return { code, message }
}

function isEmptyPeriodError(code?: string, message?: string): boolean {
    return (
        code === 'POINT_PERIOD_EMPTY' ||
        code === '404-2' ||
        (typeof message === 'string' && message.includes('포인트 내역') && message.includes('없습니다'))
    )
}

async function fetchPoints(params: {
    page: number
    size: number
    startAt?: string
    endAt?: string
}): Promise<SpringPage<PointHistory>> {
    const { page, size, startAt, endAt } = params
    const usp = new URLSearchParams()
    usp.set('page', String(page))
    usp.set('size', String(size))
    usp.append('sort', 'addAt,DESC')
    if (startAt) usp.set('startAt', startAt)
    if (endAt) usp.set('endAt', endAt)

    const res = await fetch(`${MEMBER_BASE}/api/points/me?${usp.toString()}`, {
        credentials: 'include',
    })

    if (!res.ok) {
        let body: unknown
        try {
            body = await res.json()
        } catch (_e) {
            body = undefined // JSON 아니면 그냥 pass
        }
        const { code, message } = pickError(body)
        if (isEmptyPeriodError(code, message)) return EMPTY_PAGE
        throw new Error(message ?? `HTTP ${res.status}`)
    }

    const rs = (await res.json()) as RsPage<PointHistory>
    return rs?.data ?? EMPTY_PAGE
}

export function usePointHistories(page: number, size: number, startAt?: string, endAt?: string) {
    return useQuery<SpringPage<PointHistory>, Error>({
        queryKey: ['points', page, size, startAt ?? '', endAt ?? ''],
        queryFn: () => fetchPoints({ page, size, startAt, endAt }),
        // ✅ 버전 차이로 인한 제네릭/시그니처 문제를 피하려면 상수로 주는 게 가장 안전
        placeholderData: EMPTY_PAGE,
        retry: false, // 404-2(기간 내역 없음)는 재시도 불필요
    })
}