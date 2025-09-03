'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccomplishments } from '@/hooks/useAccomplishments'
import { Trophy } from 'lucide-react'
import QnaPreviewCard from '@/components/dashboard/QnaPreviewCard'

export default function MeHomePage() {
    const { data: accomplishments, loading: loadingAch } = useAccomplishments(3)

    return (
        <div className="space-y-8">
            {/* 소개 */}
            <Card className="bg-white/80 dark:bg-gray-800/80 relative">
                <CardHeader>
                    <CardTitle className="text-lg">소개</CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-5 right-5"
                    >
                        작성하기
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        소개글이 비어있어요. 나만의 스킬, 경력/링크 등으로 소개글을 채워보세요.
                    </p>
                </CardContent>
            </Card>

            {/* 업적 + 1:1 문의 */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* 업적 카드 */}
                <Card className="bg-white/80 dark:bg-gray-800/80 relative">
                    <CardHeader>
                        <CardTitle className="text-lg">내 업적</CardTitle>
                        <Link href="/me/accomplished">
                            <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-5 right-5"
                            >
                                더보기
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loadingAch ? (
                            <Skeleton className="h-20 w-full" />
                        ) : accomplishments.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {accomplishments.map(a => (
                                    <li key={a.accomplishedId} className="flex items-center gap-2 border-b pb-1">
                                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span className="font-medium">{a.challengeName}</span>
                                        <span className="text-muted-foreground ml-auto">
                                            {new Date(a.accomplishedAt).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">아직 달성한 업적이 없어요.</p>
                        )}
                    </CardContent>
                </Card>

                {/* 1:1 문의 */}
                {/* 1:1 문의 프리뷰 카드 (최근 3건) */}
                <QnaPreviewCard />
            </div>

            {/* 스터디 / 취미 */}
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