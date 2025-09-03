'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import {Skeleton} from '@/components/ui/skeleton'
import {Badge} from '@/components/ui/badge'
import {useQnaPreviewSmart, useIsAdminProbe} from '@/hooks/useQna'

dayjs.locale('ko')

export default function QnaPreviewCard() {
    const {data, isLoading, isError} = useQnaPreviewSmart()
    const {data: isAdmin} = useIsAdminProbe()

    const title = isAdmin ? '전체 1:1 문의' : '나의 1:1 문의 내역'
    const base = isAdmin ? '/me/qna-admin' : '/me/qna'

    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 relative">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <Link href={base}>
          <span className="absolute top-5 right-5">
              <span className="inline-flex h-8 items-center rounded-md border px-3 text-sm">더보기</span>
          </span>
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-full"/>
                        <Skeleton className="h-6 w-full"/>
                        <Skeleton className="h-6 w-full"/>
                    </div>
                )}

                {isError && (
                    <div className="text-sm text-red-500">불러오기에 실패했어요.</div>
                )}

                {!isLoading && !isError && data?.content.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                        최근 문의가 없어요.
                    </div>
                )}

                {!isLoading && !isError && data && data.content.length > 0 && (
                    <ul className="divide-y divide-emerald-200">
                        {data.content.map((q) => (
                            <li key={q.id} className="flex items-center gap-2 py-2">
                                <Badge className={q.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-amber-500'}>
                                    {q.status === 'COMPLETED' ? '답변 완료' : '진행 중'}
                                </Badge>
                                <Link href={`${base}/${q.id}`} className="flex-1 truncate text-sm hover:underline">
                                    {q.content}
                                </Link>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
            {dayjs(q.createdAt).format('YYYY.MM.DD HH:mm')}
          </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}