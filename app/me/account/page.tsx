'use client'

import { useEffect, useState } from 'react'
import { useMember, MemberInfo } from '@/hooks/useMember'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const MEMBER_BASE = 'http://localhost:8080'

export default function AccountPage() {
    const { data, loading } = useMember()
    const [form, setForm] = useState<Partial<MemberInfo>>({})

    useEffect(() => {
        if (data) {
            setForm({
                nickname: data.nickname,
                profileImage: data.profileImage ?? '',
                address: data.address ?? '',
                matchingEnabled: data.matchingEnabled ?? false,
            })
        }
    }, [data])

    const onSave = async () => {
        try {
            const res = await fetch(`${MEMBER_BASE}/api/members/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nickname: form.nickname,
                    profileImage: form.profileImage ?? null,
                    address: form.address ?? null,
                }),
            })
            if (!res.ok) throw new Error()
            toast.success('계정 정보가 수정되었습니다.')
        } catch {
            toast.error('수정에 실패했습니다.')
        }
    }

    const onToggleMatching = async (next: boolean) => {
        setForm((p) => ({ ...p, matchingEnabled: next }))
        try {
            const res = await fetch(`${MEMBER_BASE}/api/members/me/matching`, {
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
            const res = await fetch(`${MEMBER_BASE}/api/members/withdraw`, {
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
                        <div className="md:col-span-2">
                            <label className="text-sm text-muted-foreground">주소</label>
                            <Input
                                value={form.address ?? ''}
                                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <div className="font-medium">매칭 기능</div>
                            <p className="text-sm text-muted-foreground">
                                다른 사용자에게 매칭 대상으로 노출됩니다.
                            </p>
                        </div>
                        <Switch
                            checked={!!form.matchingEnabled}
                            onCheckedChange={onToggleMatching}
                        />
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
                        <Button onClick={onSave} className="mr-2">저장</Button>
                        <Button variant="destructive" onClick={onWithdraw}>회원 탈퇴</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}