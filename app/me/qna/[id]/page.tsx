'use client'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyThread } from '@/hooks/useQna'
import QnaThreadLinearView from '@/components/qna/QnaThreadLinearView'

export default function MyQnaThreadPage() {
    const params = useParams()
    const id = Number(params?.id)
    const { data, isLoading, isError } = useMyThread(id)

    return (
        <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardHeader><CardTitle className="text-lg">내 1:1 문의 상세</CardTitle></CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-24 w-full" />}
                {isError && <div className="text-sm text-red-500">조회 권한이 없거나 존재하지 않습니다.</div>}
                {data && <QnaThreadLinearView root={data.root} mode="me" />}
            </CardContent>
        </Card>
    )
}