'use client'

import { useEffect, useState } from 'react'

const MEMBER_BASE = 'http://localhost:8080'

export type MemberInfo = {
    memberId: number
    nickname: string
    profileImage?: string | null
    address?: string | null
    matchingEnabled?: boolean
    phoneVerified?: boolean
}

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
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const body = await res.json()
                // 백엔드 응답 래퍼 RsData { data: {...} } 기준
                const info = (body.data ?? body) as MemberInfo
                if (mounted) setData(info)
            } catch (e: any) {
                if (mounted) setError(e?.message ?? 'failed')
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [])

    return { data, loading, error }
}