'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthSuccess() {
    const router = useRouter()
    const sp = useSearchParams()
    const step = sp.get('step') ?? 'complete'
    const provider = sp.get('provider') ?? ''

    useEffect(() => {
        if (provider) {
            // 최근 로그인 프로바이더 저장
            localStorage.setItem('grow:lastProvider', provider)
        }
        // 분기 이동
        if (step === 'enter-phone') router.replace('/onboarding/phone')
        else router.replace('/dashboard')
    }, [provider, step, router])

    return (
        <main className="mx-auto max-w-lg p-8 text-center">
            <h1 className="text-2xl font-bold">로그인 처리 중…</h1>
            <p className="text-muted-foreground mt-2">잠시만 기다려 주세요.</p>
        </main>
    )
}