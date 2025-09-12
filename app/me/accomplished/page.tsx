'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MEMBER_BASE_URL } from '@/lib/env'

type Accomplished = {
    accomplishedId: number
    challengeId: number
    challengeName: string
    accomplishedAt: string
}

type PageResp<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    number: number // 현재 페이지 번호
    size: number
}

export default function AccomplishedPage() {
    const [page, setPage] = useState(0)
    const [data, setData] = useState<PageResp<Accomplished> | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                setLoading(true)
                const res = await fetch(`${MEMBER_BASE_URL}/api/v1/members/accomplished/me?page=${page}&size=10`, {
                    credentials: 'include',
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const body = await res.json()
                const paged: PageResp<Accomplished> = body.data
                if (mounted) setData(paged)
            } catch (e) {
                console.error(e)
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [page])

    return (
        <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg">내 업적 전체 보기</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    ) : data && data.content.length > 0 ? (
                        <ul className="divide-y">
                            {data.content.map(a => (
                                <li key={a.accomplishedId} className="flex items-center gap-2 py-2">
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

            {/* 페이지네이션 */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage(p => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        이전
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">
            {page + 1} / {data.totalPages}
          </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage(p => Math.min(p + 1, data.totalPages - 1))}
                        disabled={page >= data.totalPages - 1}
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    )
}