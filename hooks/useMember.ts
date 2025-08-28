'use client'

import { useEffect, useState } from 'react'

const MEMBER_BASE = process.env.NEXT_PUBLIC_MEMBER_BASE ?? 'http://localhost:8081'

export type MemberInfo = {
    memberId: number
    nickname: string
    profileImage?: string | null
    address?: string | null
    matchingEnabled?: boolean
    phoneVerified?: boolean
    totalPoint: number
}

/**
 * 현재 로그인한 회원 정보 조회 훅 (기존 코드 유지, any 제거)
 */
export function useMember() {
    const [data, setData] = useState<MemberInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                setLoading(true)
                const res = await fetch(`${MEMBER_BASE}/api/members/me`, {
                    credentials: 'include',
                })
                if (!res.ok) {
                    const msg = `HTTP ${res.status}`
                    throw new Error(msg)
                }

                const body = (await res.json().catch(() => null)) as unknown | null
                const maybeData =
                    (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>)
                        ? (body as Record<string, unknown>)['data']
                        : body) as unknown | null

                if (maybeData && typeof maybeData === 'object') {
                    const info = {
                        memberId: Number((maybeData as Record<string, unknown>)['memberId']),
                        nickname: String((maybeData as Record<string, unknown>)['nickname']),
                        profileImage:
                            typeof (maybeData as Record<string, unknown>)['profileImage'] === 'string'
                                ? ((maybeData as Record<string, unknown>)['profileImage'] as string)
                                : null,
                        address:
                            typeof (maybeData as Record<string, unknown>)['address'] === 'string'
                                ? ((maybeData as Record<string, unknown>)['address'] as string)
                                : null,
                        matchingEnabled:
                            typeof (maybeData as Record<string, unknown>)['matchingEnabled'] === 'boolean'
                                ? ((maybeData as Record<string, unknown>)['matchingEnabled'] as boolean)
                                : undefined,
                        phoneVerified:
                            typeof (maybeData as Record<string, unknown>)['phoneVerified'] === 'boolean'
                                ? ((maybeData as Record<string, unknown>)['phoneVerified'] as boolean)
                                : undefined,
                        totalPoint:
                            typeof (maybeData as Record<string, unknown>)['totalPoint'] === 'number'
                                ? ((maybeData as Record<string, unknown>)['totalPoint'] as number)
                                : Number((maybeData as Record<string, unknown>)['totalPoint'] ?? 0),
                    } as MemberInfo

                    if (mounted) setData(info)
                } else {
                    if (mounted) setData(null)
                }
            } catch (e) {
                if (mounted) {
                    const msg = e instanceof Error ? e.message : 'failed'
                    setError(msg)
                }
            } finally {
                if (mounted) setLoading(false)
            }
        })()

        return () => {
            mounted = false
        }
    }, [])

    return { data, loading, error }
}

/* ------------------------------------------------------------------
   멤버 id -> MemberInfo 매핑 훅
   - 서버에 /api/members/{id}
-------------------------------------------------------------------*/

/**
 * id 목록으로 개별 GET 요청을 보낸 뒤 id->MemberInfo 맵을 반환
 */
export async function fetchMembersByIds(ids: number[]): Promise<Record<number, MemberInfo>> {
    if (!ids || ids.length === 0) return {}

    const uniqIds = Array.from(new Set(ids.filter((id) => typeof id === 'number' && !Number.isNaN(id))))

    const results = await Promise.all(
        uniqIds.map(async (id) => {
            try {
                const r = await fetch(`${MEMBER_BASE}/api/members/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                })
                if (!r.ok) return null
                const raw = (await r.json().catch(() => null)) as unknown | null
                const maybeData = raw && typeof raw === 'object' && 'data' in (raw as Record<string, unknown>) ? (raw as Record<string, unknown>)['data'] : raw
                if (maybeData && typeof maybeData === 'object') {
                    const record = maybeData as Record<string, unknown>
                    const memberId = Number(record['memberId'])
                    const nickname = String(record['nickname'])
                    const profileImage = typeof record['profileImage'] === 'string' ? (record['profileImage'] as string) : null
                    const address = typeof record['address'] === 'string' ? (record['address'] as string) : null
                    const matchingEnabled = typeof record['matchingEnabled'] === 'boolean' ? (record['matchingEnabled'] as boolean) : undefined
                    const phoneVerified = typeof record['phoneVerified'] === 'boolean' ? (record['phoneVerified'] as boolean) : undefined
                    const totalPoint = typeof record['totalPoint'] === 'number' ? (record['totalPoint'] as number) : Number(record['totalPoint'] ?? 0)

                    return {
                        memberId,
                        nickname,
                        profileImage,
                        address,
                        matchingEnabled,
                        phoneVerified,
                        totalPoint,
                    } as MemberInfo
                }
                return null
            } catch {
                return null
            }
        }),
    )

    const map: Record<number, MemberInfo> = {}
    for (const m of results) {
        if (m) map[m.memberId] = m
    }
    return map
}

/**
 * useMemberNicknames
 * - ids: number[] | undefined
 * 반환: { data: Record<number,MemberInfo> | null, loading: boolean, error: string | null }
 */
export function useMemberNicknames(ids: number[] | undefined) {
    const [data, setData] = useState<Record<number, MemberInfo> | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const uniq = Array.from(new Set((ids ?? []).filter((v) => typeof v === 'number' && !Number.isNaN(v))))

        if (uniq.length === 0) {
            setData(null)
            setLoading(false)
            setError(null)
            return
        }

        ;(async () => {
            try {
                setLoading(true)
                setError(null)
                const map = await fetchMembersByIds(uniq)
                if (mounted) setData(map)
            } catch (e) {
                if (mounted) {
                    const msg = e instanceof Error ? e.message : 'failed to fetch members'
                    setError(msg)
                }
            } finally {
                if (mounted) setLoading(false)
            }
        })()

        return () => {
            mounted = false
        }
    }, [ (ids ?? []).join(',') ]) // ids 변경 시 재요청 (join 사용으로 비교 비용 감소)

    return { data, loading, error }
}