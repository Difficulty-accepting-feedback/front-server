'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { useMember, MemberInfo } from '@/hooks/useMember'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { MEMBER_BASE_URL } from '@/lib/env'

declare global {
    interface Window { daum: any }
}

type FormState = Partial<MemberInfo> & {
    sggCode?: string;       // ✅ 시군구 코드(5자리) - bcode 앞 5자리
    regionLabel?: string;   // ✅ 표시용 라벨 ("서울특별시 강남구")
}

export default function AccountPage() {
    const { data, loading } = useMember()
    const [form, setForm] = useState<FormState>({})
    const [postcodeReady, setPostcodeReady] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (data) {
            setForm({
                nickname: data.nickname,
                profileImage: data.profileImage ?? '',
                address: data.address ?? '',
                matchingEnabled: data.matchingEnabled ?? false,
                // regionLabel/sggCode는 서버 저장 이후 다시 불러오면 채우도록(옵션)
            })
        }
    }, [data])

    const openAddressPicker = () => {
        if (!postcodeReady || !window.daum?.Postcode) {
            toast.error('주소 검색 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
            return
        }
        new window.daum.Postcode({
            oncomplete: (d: any) => {
                const sido = (d.sido || '').trim()
                const sigungu = (d.sigungu || '').trim()
                const regionLabel = [sido, sigungu].filter(Boolean).join(' ') // "서울특별시 강남구"
                // ✅ 시군구 코드: d.bcode(법정동코드 10자리)의 앞 5자리
                const sggCode = (d.bcode && d.bcode.length >= 5) ? d.bcode.slice(0, 5) : undefined

                if (!regionLabel) {
                    const fallback = (d.address || d.roadAddress || d.jibunAddress || '').trim()
                    setForm((p) => ({ ...p, address: fallback, regionLabel: fallback, sggCode }))
                } else {
                    setForm((p) => ({ ...p, address: regionLabel, regionLabel, sggCode }))
                }
                toast.success('주소가 선택되었습니다. 저장을 눌러 반영하세요.')
            },
        }).open()
    }

    const onSave = async () => {
        try {
            setSaving(true)
            // 1) 기본 프로필/주소 저장 (표시용 address)
            const res = await fetch(`${MEMBER_BASE_URL}/api/v1/members/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nickname: form.nickname,
                    profileImage: form.profileImage ?? null,
                    address: form.regionLabel ?? form.address ?? null,
                }),
            })
            if (!res.ok) throw new Error('profile save failed')

            // 2) 좌표 업서트 트리거 (코드 우선, 없으면 텍스트)
            if ((form.regionLabel ?? form.address)?.trim()) {
                const geo = await fetch(`${MEMBER_BASE_URL}/api/v1/members/me/region`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        region: form.regionLabel ?? form.address,
                        sggCode: form.sggCode ?? null,
                    }),
                })
                if (!geo.ok) throw new Error('geocoding trigger failed')
            }

            toast.success('계정 정보가 수정되었습니다.')
        } catch (e) {
            toast.error('수정에 실패했습니다.')
        } finally {
            setSaving(false)
        }
    }

    const onToggleMatching = async (next: boolean) => {
        setForm((p) => ({ ...p, matchingEnabled: next }))
        try {
            const res = await fetch(`${MEMBER_BASE_URL}/api/v1/members/me/matching`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isEnabled: next }),
            })
            if (!res.ok) throw new Error()
            toast.success(next ? '매칭 기능을 켰습니다.' : '매칭 기능을 껐습니다.')
        } catch {
            toast.error('매칭 설정 변경에 실패했습니다.')
            setForm((p) => ({ ...p, matchingEnabled: !next }))
        }
    }

    const onWithdraw = async () => {
        if (!confirm('정말 탈퇴하시겠어요? 복구가 불가합니다.')) return
        try {
            const res = await fetch(`${MEMBER_BASE_URL}/api/v1/members/withdraw`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (!res.ok) throw new Error()
            toast.success('탈퇴가 완료되었습니다.')
            location.href = '/'
        } catch {
            toast.error('탈퇴 처리에 실패했습니다.')
        }
    }

    if (loading || !data) {
        return <div className="text-sm text-muted-foreground">불러오는 중…</div>
    }

    return (
        <>
            {/* Daum 우편번호 */}
            <Script
                src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
                strategy="afterInteractive"
                onLoad={() => setPostcodeReady(true)}
            />
            <div className="space-y-8">
                <Card className="bg-white/80 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg">계정 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground">닉네임</label>
                                <Input
                                    value={form.nickname ?? ''}
                                    onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">프로필 이미지 URL</label>
                                <Input
                                    value={form.profileImage ?? ''}
                                    onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))}
                                />
                            </div>

                            {/* 주소 입력: 우편번호 팝업으로 구 단위 텍스트 + sggCode 세팅 */}
                            <div className="md:col-span-2">
                                <label className="text-sm text-muted-foreground">주소</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={form.regionLabel ?? form.address ?? ''}
                                        readOnly
                                        placeholder="주소찾기를 눌러 선택하세요 (예: 서울특별시 강남구)"
                                    />
                                    <Button type="button" variant="outline" onClick={openAddressPicker}>
                                        주소찾기
                                    </Button>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    <b>시/도 + 시/군/구</b>까지만 저장합니다.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <div className="font-medium">매칭 기능</div>
                                <p className="text-sm text-muted-foreground">다른 사용자에게 매칭 대상으로 노출됩니다.</p>
                            </div>
                            <Switch checked={!!form.matchingEnabled} onCheckedChange={onToggleMatching} />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <div className="font-medium">휴대폰 인증</div>
                                <p className="text-sm text-muted-foreground">
                                    현재 상태: {data.phoneVerified ? '인증 완료' : '미인증'}
                                </p>
                            </div>
                            {!data.phoneVerified && (
                                <Button variant="outline" onClick={() => (location.href = '/onboarding/phone')}>
                                    인증하러 가기
                                </Button>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button onClick={onSave} className="mr-2" disabled={saving}>
                                {saving ? '저장 중…' : '저장'}
                            </Button>
                            <Button variant="destructive" onClick={onWithdraw}>
                                회원 탈퇴
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}