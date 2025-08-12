'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMember } from '@/hooks/useMember'

export default function MeHomePage() {
    const { data, loading } = useMember()

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* 소개 섹션 */}
            <Card className="bg-white/80 dark:bg-gray-800/80">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-lg">소개</CardTitle>
                    <Button size="sm" variant="outline">작성하기</Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        소개글이 비어있어요. 나만의 스킬, 경력/링크 등으로 소개글을 채워보세요.
                    </p>
                </CardContent>
            </Card>

            {/* 1:1 문의(플레이스홀더) */}
            <Card className="bg-white/80 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg">나의 1:1 문의 내역</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-emerald-100 p-6 text-center text-sm text-muted-foreground">
                        최근 3건 표시 (연동 대기)
                    </div>
                </CardContent>
            </Card>

            {/* 스터디 / 취미 프리뷰 (플레이스홀더) */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white/80 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg">전체 스터디 참여 내역</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-emerald-100 p-6 text-center text-sm text-muted-foreground">
                            최근 3건 표시 (연동 대기)
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg">전체 취미 참여 내역</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-emerald-100 p-6 text-center text-sm text-muted-foreground">
                            최근 3건 표시 (연동 대기)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}