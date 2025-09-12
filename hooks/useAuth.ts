'use client'
import { useEffect, useState } from 'react'
import { MEMBER_BASE_URL } from '@/lib/env'

type MeResp = {
    code: string
    message: string
    data: { memberId: number; email: string; nickname: string; profileImage?: string }
}

export function useAuth() {
    const [me, setMe] = useState<MeResp['data'] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${MEMBER_BASE_URL}/api/v1/members/me`, { credentials: 'include' })
            .then(async r => (r.ok ? r.json() : Promise.reject(await r.text())))
            .then((j: MeResp) => setMe(j.data))
            .catch(() => setMe(null))
            .finally(() => setLoading(false))
    }, [])

    return { me, loading }
}