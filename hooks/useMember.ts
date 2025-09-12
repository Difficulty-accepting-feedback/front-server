'use client'

import { useEffect, useState } from 'react'
import { MEMBER_BASE_URL } from '@/lib/env'

export type MemberInfo = {
    memberId: number
    nickname: string
    profileImage?: string | null
    address?: string | null
    matchingEnabled?: boolean
    phoneVerified?: boolean
    totalPoint: number
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
                const res = await fetch(`${MEMBER_BASE_URL}/api/v1/members/me`, {
                    credentials: 'include',
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const body = await res.json()
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