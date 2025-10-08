'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function Inner() {
    const router = useRouter()
    const sp = useSearchParams()
    const step = sp.get('step') ?? 'complete'
    const provider = sp.get('provider') ?? ''
    const error = sp.get('error') || sp.get('message') || ''
    const returnTo = sp.get('returnTo') || ''

    useEffect(() => {
        if (error) {
            const q = new URLSearchParams()
            q.set('message', error)
            router.replace(`/auth/fail?${q.toString()}`)
            return
        }
        if (provider) {
            try {
                localStorage.setItem('grow:lastProvider', provider)
                localStorage.setItem('grow:lastProviderAt', String(Date.now()))
            } catch {}
        }
        if (step === 'enter-phone') {
            router.replace('/onboarding/phone')
            return
        }
        if (returnTo && returnTo.startsWith('/')) router.replace(returnTo)
        else router.replace('/')
    }, [provider, step, error, returnTo, router])

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