'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function Inner() {
    const router = useRouter()
    const sp = useSearchParams()
    const step = sp.get('step') ?? 'complete'
    const provider = sp.get('provider') ?? ''

    useEffect(() => {
        if (provider) localStorage.setItem('grow:lastProvider', provider)
        if (step === 'enter-phone') router.replace('/onboarding/phone')
        else router.replace('/')
    }, [provider, step, router])

    return (
        <main className="mx-auto max-w-lg p-8 text-center">
            <h1 className="text-2xl font-bold">로그인 처리 중…</h1>
            <p className="text-muted-foreground mt-2">잠시만 기다려 주세요.</p>
        </main>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div>로그인 처리 중…</div>}>
            <Inner />
        </Suspense>
    )
}