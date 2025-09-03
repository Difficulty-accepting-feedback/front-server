'use client'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminThread, useIsAdminProbe } from '@/hooks/useQna'
import QnaThreadLinearView from '@/components/qna/QnaThreadLinearView'

export default function AdminQnaThreadPage() {
    const { data: isAdmin } = useIsAdminProbe()
    const params = useParams()
    const id = Number(params?.id)
    const { data, isLoading, isError } = useAdminThread(id, !!isAdmin)

    if (isAdmin === false) return <p className="text-sm text-muted-foreground">관리자 권한이 없습니다.</p>

    return (
        <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardHeader><CardTitle className="text-lg">QnA 상세 (관리자)</CardTitle></CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-24 w-full" />}
                {isError && <div className="text-sm text-red-500">조회 실패</div>}
                {data && <QnaThreadLinearView root={data.root} mode="admin" />}
            </CardContent>
        </Card>
    )
}