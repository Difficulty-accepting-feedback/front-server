'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Phone, ShieldCheck, TimerReset } from 'lucide-react'
import { MEMBER_BASE_URL } from '@/lib/env'

export default function PhoneOnboarding() {
    const router = useRouter()
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [verificationId, setVerificationId] = useState<number | null>(null)
    const [loadingReq, setLoadingReq] = useState(false)
    const [loadingVerify, setLoadingVerify] = useState(false)

    const requestCode = async () => {
        const digits = phone.replace(/\D/g, '')
        if (!/^\d{10,11}$/.test(digits)) {
            toast.error('휴대폰 번호를 정확히 입력해 주세요.')
            return
        }
        setLoadingReq(true)
        try {
            const res = await fetch(`${MEMBER_BASE_URL}/api/verification/request`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ phoneNumber: digits }),
            })
            if (!res.ok) throw new Error(await res.text())
            const json: { code: string; message: string; data: number } = await res.json()
            setVerificationId(json.data)
            toast.success('인증 코드가 전송되었어요.')
        } catch (e: any) {
            toast.error('코드 전송 실패', { description: e?.message ?? '다시 시도해 주세요.' })
        } finally {
            setLoadingReq(false)
        }
    }

    const verifyCode = async () => {
        if (!code || code.length < 4) {
            toast.error('인증 코드를 입력해 주세요.')
            return
        }
        setLoadingVerify(true)
        try {
            const res = await fetch(`${MEMBER_BASE_URL}/api/verification/verify`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code }),
            })
            if (!res.ok) throw new Error(await res.text())
            toast.success('인증이 완료되었습니다!')
            router.replace('/')
        } catch (e: any) {
            toast.error('인증 실패', { description: e?.message ?? '코드를 확인하고 다시 시도해 주세요.' })
        } finally {
            setLoadingVerify(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-50 p-4 md:p-8 dark:from-gray-800 dark:to-gray-900">
            <Card className="mx-auto max-w-sm border border-emerald-200 shadow-lg backdrop-blur-md bg-white/60 hover:scale-[1.01] transition-transform duration-300">
                <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-sm text-center py-2">
                    안전한 이용을 위해 본인 인증을 완료해 주세요
                </div>

                <CardHeader className="text-center space-y-2 pt-6">
                    <CardTitle className="text-2xl font-bold text-emerald-900">휴대폰 인증</CardTitle>
                    <p className="text-sm text-muted-foreground">문자로 받은 코드를 입력하면 인증이 완료됩니다.</p>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-8">
                    {/* 전화번호 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">휴대폰 번호</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={phone}
                                inputMode="numeric"
                                placeholder="01012345678"
                                className="pl-9 h-11 border-emerald-200 focus:border-emerald-500"
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                disabled={loadingReq}
                            />
                        </div>
                        <Button
                            onClick={requestCode}
                            disabled={loadingReq}
                            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                            type="button"
                        >
                            {loadingReq ? '전송 중…' : '코드 전송'}
                        </Button>
                    </div>

                    {/* 인증 코드 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">인증 코드</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={code}
                                inputMode="numeric"
                                placeholder="4~6자리 숫자"
                                className="pl-9 h-11 border-emerald-200 focus:border-emerald-500"
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                disabled={!verificationId || loadingVerify}
                            />
                        </div>
                        <Button
                            onClick={verifyCode}
                            disabled={!verificationId || loadingVerify}
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                            type="button"
                        >
                            {loadingVerify ? '확인 중…' : '인증 완료'}
                        </Button>
                    </div>

                    {/* 재전송 */}
                    {verificationId && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>코드가 오지 않았나요?</span>
                            <button onClick={requestCode} className="inline-flex items-center gap-1 hover:underline" type="button">
                                <TimerReset className="h-3.5 w-3.5" /> 다시 보내기
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}