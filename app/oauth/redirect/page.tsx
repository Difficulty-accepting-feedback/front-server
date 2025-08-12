'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OAuthRedirect() {
    const router = useRouter()
    const sp = useSearchParams()

    // 백엔드가 넘겨주는 값들 가정
    const step = sp.get('step') ?? 'complete'                 // 'enter-phone' | 'complete'
    const provider = sp.get('provider') ?? ''                 // 'google' | 'kakao' | 'naver'
    const error = sp.get('error') || sp.get('message') || ''  // 실패 시
    const returnTo = sp.get('returnTo') || ''                 // 선택: 원래 가려던 경로

    useEffect(() => {
        // 실패면 실패 페이지로 위임
        if (error) {
            const q = new URLSearchParams()
            q.set('message', error)
            router.replace(`/auth/fail?${q.toString()}`)
            return
        }

        // 성공: 최근 로그인 프로바이더 저장(로그인 페이지 배너용)
        if (provider) {
            try {
                localStorage.setItem('grow:lastProvider', provider)
                localStorage.setItem('grow:lastProviderAt', String(Date.now()))
            } catch { /* noop */ }
        }

        // 휴대폰 인증 스텝 분기
        if (step === 'enter-phone') {
            router.replace('/onboarding/phone')
            return
        }

        // 기본 이동
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