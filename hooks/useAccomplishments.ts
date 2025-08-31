'use client'

import { useEffect, useState } from 'react'
import { MEMBER_BASE_URL } from '@/lib/env'

export type Accomplished = {
    accomplishedId: number
    challengeId: number
    challengeName: string
    accomplishedAt: string
}

export function useAccomplishments(limit = 3) {
    const [data, setData] = useState<Accomplished[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                setLoading(true)
                const res = await fetch(`${MEMBER_BASE_URL}/api/accomplished/me?page=0&size=${limit}`, {
                    credentials: 'include',
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const body = await res.json()
                // RsData { data: { content: [...] } } 기준
                const list = body.data?.content ?? []
                if (mounted) setData(list)
            } catch (e) {
                if (mounted) {
                    if (e instanceof Error) {
                        setError(e.message)
                    } else {
                        setError('알 수 없는 오류 발생')
                    }
                }
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [limit])

    return { data, loading, error }
}