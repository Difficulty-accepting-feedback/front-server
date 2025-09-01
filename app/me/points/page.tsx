'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { useQueryClient } from '@tanstack/react-query'
import { useMember } from '@/hooks/useMember'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Coins, RefreshCcw, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { usePointHistories, PointHistory, EMPTY_PAGE } from '@/hooks/usePoints'

dayjs.locale('ko')

type Row = {
    id: number
    amount: number
    content: string
    addAt: string
    balanceAfter?: number
}

export default function PointsPage() {
    const [page, setPage] = useState(1) // UI 1-base
    const size = 10

    // 기간 필터(날짜-시간) — LocalDateTime 문자열(오프셋 없이)로 보냄
    const [from, setFrom] = useState<string>('') // YYYY-MM-DD
    const [to, setTo] = useState<string>('')     // YYYY-MM-DD

    const startAt = useMemo(() => (!from ? undefined : dayjs(from).startOf('day').format('YYYY-MM-DDTHH:mm:ss')), [from])
    const endAt   = useMemo(() => (!to   ? undefined : dayjs(to).endOf('day').format('YYYY-MM-DDTHH:mm:ss')),   [to])

    // A안: 현재 보유 포인트는 Member.totalPoint에서 읽음
    const { data: me } = useMember()
    const myTotalPoint = me?.totalPoint ?? 0

    const {
        data = EMPTY_PAGE,
        isLoading = false,
        isError = false,
    } = usePointHistories(page - 1, size, startAt, endAt)

    const qc = useQueryClient()

    const items = data.content
    const total = data.totalElements
    const isEmpty = !isLoading && !isError && items.length === 0

    const rows: Row[] = useMemo(
        () => items.map((p: PointHistory) => ({
            id: p.pointHistoryId,
            amount: p.amount,
            content: p.content,
            addAt: p.addAt,
            balanceAfter: p.balanceAfter,
        })),
        [items]
    )

    const refresh = () =>
        qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'points' })

    const onSearch = () => {
        setPage(1)
        refresh()
    }

    // ✅ 버튼 disabled에 확실한 boolean만 넘기도록 중간 변수로 고정
    const prevDisabled = page <= 1 || isLoading
    const nextDisabled = items.length < size || isLoading

    return (
        <div className="space-y-8">
            <Card className="bg-white/80 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg">포인트 내역</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* 상단 요약 카드만 유지 */}
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                        <div className="rounded-xl border border-emerald-100/60 bg-emerald-50/60 dark:bg-emerald-900/20 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">보유 포인트</span>
                                <Coins className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="mt-2 text-2xl font-bold tabular-nums">
                                {myTotalPoint.toLocaleString()} <span className="text-base font-medium">P</span>
                            </div>
                        </div>
                    </div>

                    {/* 검색/필터 바 */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <div className="text-sm text-muted-foreground">기간 필터</div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="h-9 rounded-md border px-2 text-sm bg-white/70 dark:bg-gray-900/30"
                                />
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="h-9 rounded-md border px-2 text-sm bg-white/70 dark:bg-gray-900/30"
                                />
                                <Button onClick={onSearch} disabled={isLoading} className="h-9">
                                    검색
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border-emerald-200"
                                onClick={refresh}
                                disabled={isLoading}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                새로고침
                            </Button>
                        </div>
                    </div>

                    {/* 에러/로딩/빈 상태 */}
                    {isError && (
                        <div className="flex min-h-[160px] items-center justify-center text-red-600 gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            포인트 내역을 불러오지 못했습니다.
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-2">
                            <div className="h-16 rounded-lg bg-emerald-100/40 animate-pulse" />
                            <div className="h-16 rounded-lg bg-emerald-100/40 animate-pulse" />
                            <div className="h-16 rounded-lg bg-emerald-100/40 animate-pulse" />
                        </div>
                    )}

                    {isEmpty && !isLoading && !isError && (
                        <div className="flex min-h-[160px] flex-col items-center justify-center text-muted-foreground">
                            해당 조건의 포인트 내역이 없습니다.
                        </div>
                    )}

                    {/* 리스트 */}
                    {!isEmpty && !isLoading && !isError && (
                        <div className="rounded-xl border border-emerald-100/60 bg-white/70 dark:bg-gray-900/20">
                            <ul className="divide-y divide-emerald-100/60">
                                {rows.map((r) => {
                                    const plus = r.amount > 0
                                    return (
                                        <li key={r.id} className="relative">
                                            <div className="pl-5 pr-5 py-4 flex items-start gap-3 hover:bg-emerald-50/40 transition-colors">
                                                <div className="mt-0.5 shrink-0 grid place-items-center h-9 w-9 rounded-full bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700">
                                                    <Coins className="h-5 w-5" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={plus ? 'bg-emerald-600' : 'bg-gray-500'}>
                                                            {plus ? '적립' : '차감'}
                                                        </Badge>

                                                        <span className="ml-auto text-xs text-muted-foreground">
                              {dayjs(r.addAt).format('YYYY.MM.DD HH:mm')}
                            </span>

                                                        {/* 행별 잔액(스냅샷) */}
                                                        <span className="text-xs tabular-nums ml-3 text-emerald-700 dark:text-emerald-300">
                              잔액 {(r.balanceAfter ?? 0).toLocaleString()} P
                            </span>
                                                    </div>

                                                    <div className="mt-1 flex items-center gap-3">
                                                        <div className="text-base font-semibold tabular-nums">
                                                            {plus ? '+' : '−'}
                                                            {Math.abs(r.amount).toLocaleString()} P
                                                        </div>
                                                        <div className="truncate text-sm text-foreground">{r.content}</div>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 ml-auto mt-0.5">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500/70" />
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>

                            <Separator />
                            <div className="flex items-center justify-between p-3 text-sm">
                <span className="text-muted-foreground">
                  총 <b className="text-foreground">{total}</b>건 · 페이지 <b className="text-foreground">{page}</b>
                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={prevDisabled}
                                    >
                                        이전
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={nextDisabled}
                                    >
                                        다음
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}