'use client'
import { useState } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyRootList } from '@/hooks/useQna'

export default function MyQnaListPage() {
    const [page, setPage] = useState(0)
    const size = 20
    const { data, isLoading, isError } = useMyRootList(page, size)

    return (
        <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardHeader><CardTitle className="text-lg">내 1:1 문의</CardTitle></CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-24 w-full" />}
                {isError && <div className="text-sm text-red-500">불러오기에 실패했습니다.</div>}
                {!isLoading && !isError && data?.content.length === 0 && (
                    <p className="text-sm text-muted-foreground">문의가 없습니다.</p>
                )}
                {data && data.content.length > 0 && (
                    <>
                        <ul className="divide-y divide-emerald-100/60">
                            {data.content.map((q) => (
                                <li key={q.id} className="py-3">
                                    <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${q.status==='COMPLETED'?'bg-emerald-600 text-white':'bg-amber-500 text-white'}`}>
                      {q.status==='COMPLETED' ? '답변완료' : '진행중'}
                    </span>
                                        <span className="ml-auto text-xs text-muted-foreground">
                      {dayjs(q.createdAt).format('YYYY.MM.DD HH:mm')}
                    </span>
                                    </div>
                                    <Link href={`/me/qna/${q.id}`} className="block mt-1 text-sm hover:underline truncate">
                                        {q.content}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page<=0}>이전</Button>
                            <Button variant="outline" size="sm" onClick={()=>setPage(p=>p+1)} disabled={data.content.length < size}>다음</Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}