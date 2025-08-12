'use client'

import AuthLayout from './AuthLayout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useMemo, useState } from 'react'

const MEMBER_BASE = 'http://localhost:8080'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [lastProvider, setLastProvider] = useState<string | null>(null)

    useEffect(() => {
        setLastProvider(localStorage.getItem('grow:lastProvider'))
    }, [])

    const lastMsg = useMemo(() => {
        if (!lastProvider) return null
        const map: Record<string, string> = { google: '구글', kakao: '카카오', naver: '네이버' }
        const label = map[lastProvider] ?? lastProvider.toUpperCase()
        return `최근 ${label} 계정으로 로그인하였습니다`
    }, [lastProvider])

    const go = (p: 'google' | 'kakao' | 'naver') => {
        window.location.href = `${MEMBER_BASE}/oauth2/authorization/${p}`
    }

    return (
        <AuthLayout>
            <Card className="w-full max-w-sm border border-emerald-200 shadow-lg backdrop-blur-md bg-white/60 hover:scale-105 transition-transform duration-300">
                {/* 상단 상태 알림 */}
                <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-sm text-center py-2">
                    {lastMsg ?? '소셜 계정으로 빠르게 시작해 보세요'}
                </div>

                <CardHeader className="flex flex-col items-center space-y-2 pt-6">
                    <CardTitle className="text-2xl font-bold text-emerald-900">GROW LOGIN</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 px-6 py-4">
                    {/* 이메일/비밀번호 (옵션) */}
                    <Input
                        placeholder="이메일을 입력해 주세요"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 border-emerald-200 focus:border-emerald-500"
                    />
                    <div className="relative">
                        <Input
                            placeholder="비밀번호를 입력해 주세요"
                            type={showPwd ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 pr-10 border-emerald-200 focus:border-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                        >
                            {/* 눈 아이콘 대체: 텍스트 접근성만 유지 */}
                            {showPwd ? '숨김' : '보기'}
                        </button>
                    </div>

                    <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium">
                        로그인하기
                    </Button>

                    <Link href="/signup" className="block text-center text-emerald-700 hover:underline">
                        이메일 회원가입
                    </Link>
                </CardContent>

                {/* ▼▼ 실제 브랜드 가이드에 가까운 소셜 버튼들 ▼▼ */}
                <CardFooter className="flex flex-col items-center gap-2 pb-6 px-6">
                    <span className="text-sm text-emerald-500 mb-1">SNS 계정으로 간편하게 시작하기</span>

                    {/* Google */}
                    <button
                        type="button"
                        onClick={() => go('google')}
                        aria-label="Google로 로그인"
                        className="relative w-full h-12 rounded-md border border-[#DADCE0] bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
            <span className="absolute left-3 inline-flex">
              {/* Google G 로고 (SVG) */}
                <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12a11.9 11.9 0 0 1 8 3.1l5.7-5.7A20 20 0 1 0 24 44c10.5 0 19-8.5 19-19 0-1.2-.1-2.1-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3.2 0 6.1 1.2 8.4 3.1l5.7-5.7A20 20 0 0 0 4 24c0 3.3.8 6.4 2.3 9.1l7.1-5.5A12 12 0 0 1 12 24c0-3.5 1.3-6.7 3.4-9.3l-9.1 0z" opacity=".001"/>
                <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.6l-6.6-5.4A12 12 0 0 1 12 24c0-1.3.2-2.6.6-3.8l-7-5.4A20 20 0 0 0 4 24c0 11.1 8.9 20 20 20z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 0 1 24 36c-3.6 0-6.8-1.7-8.9-4.4l-7.1 5.5A20 20 0 0 0 24 44c10.5 0 19-8.5 19-19 0-1.2-.1-2.1-.4-3.5z"/>
              </svg>
            </span>
                        <span className="text-sm font-bold text-gray-700">Google로 로그인</span>
                    </button>

                    {/* Kakao */}
                    <button
                        type="button"
                        onClick={() => go('kakao')}
                        aria-label="카카오로 로그인"
                        className="relative w-full h-12 rounded-md bg-[#FEE500] hover:brightness-95 transition-[filter] flex items-center justify-center"
                    >
            <span className="absolute left-3 inline-flex">
              {/* Kakao 말풍선 로고 (단색) */}
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#191919" d="M12 3C6.48 3 2 6.29 2 10.36c0 2.42 1.6 4.54 4.02 5.83L5 21l4.22-2.25c.88.16 1.8.25 2.78.25 5.52 0 10-3.29 10-7.36C22 6.29 17.52 3 12 3z"/>
              </svg>
            </span>
                        <span className="text-sm font-bold text-gray-700">카카오로 로그인</span>
                    </button>

                    {/* Naver */}
                    <button
                        type="button"
                        onClick={() => go('naver')}
                        aria-label="네이버로 로그인"
                        className="relative w-full h-12 rounded-md bg-[#03C75A] hover:brightness-95 transition-[filter] flex items-center justify-center"
                    >
            <span className="absolute left-3 inline-flex">
              {/* Naver N 로고 */}
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <rect width="24" height="24" rx="4" fill="#03C75A"/>
                <path d="M14.7 7v4.7L9.3 7H7v10h2.3v-4.7l5.4 4.7H17V7h-2.3z" fill="#fff"/>
              </svg>
            </span>
                        <span className="text-sm font-bold text-white">네이버로 로그인</span>
                    </button>
                </CardFooter>
            </Card>
        </AuthLayout>
    )
}