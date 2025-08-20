'use client'

import { ReactNode, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    RefreshCcw, Check, X,
    Bell, Users, BookOpen, MessageSquare, ThumbsUp, ClipboardCheck, Coins, Mail, MessageCircle, Star,
} from 'lucide-react'
import {
    useNotificationList,
    useUnreadCount,
    useMarkAllRead,
    useMarkOneRead,
    useDeleteNotification,
} from '@/hooks/useNotifications'

dayjs.locale('ko')

type Row = {
    id: number
    title: string
    content: string
    createdAt: string
    read: boolean
}

type BackendNotification = {
    id?: number
    notificationId?: number
    read?: boolean
    isRead?: boolean
    createdAt?: string
    timestamp?: string
    content?: string
    title?: string
    type?: string
    notificationType?: string | { title?: string; name?: string }
}

const ICONS: Record<string, ReactNode> = {
    '[GROW]': <Bell className="h-5 w-5" />,
    '[매칭 업데이트]': <Users className="h-5 w-5" />,
    '[스터디 공지]': <BookOpen className="h-5 w-5" />,
    '[댓글]': <MessageSquare className="h-5 w-5" />,
    '[👍]': <ThumbsUp className="h-5 w-5" />,
    '[과제]': <ClipboardCheck className="h-5 w-5" />,
    '[포인트]': <Coins className="h-5 w-5" />,
    '[쪽지]': <Mail className="h-5 w-5" />,
    '[문의 답변]': <MessageCircle className="h-5 w-5" />,
    '[리뷰]': <Star className="h-5 w-5" />,
}

export default function NotificationsPage() {
    const [page, setPage] = useState(1)
    const size = 10

    const qc = useQueryClient()

    const { data: unread = 0 } = useUnreadCount()
    const { data, isLoading, isError } = useNotificationList(page - 1, size)
    const markAll = useMarkAllRead()
    const markOne = useMarkOneRead()
    const delOne  = useDeleteNotification()

    const itemsRaw = (data?.items ?? []) as BackendNotification[]
    const total    = data?.totalElements ?? 0
    const isEmpty  = !isLoading && !isError && total === 0

    const rows: Row[] = useMemo(() => {
        return itemsRaw.map((n: BackendNotification) => {
            const id        = n.id ?? n.notificationId ?? 0
            const read      = n.read ?? n.isRead ?? false
            const createdAt = n.createdAt ?? n.timestamp ?? ''
            const title =
                n.title ??
                n.type ??
                (typeof n.notificationType === 'string'
                    ? n.notificationType
                    : n.notificationType?.title ?? n.notificationType?.name ?? '[GROW]')
            return { id, title, content: n.content ?? '', createdAt, read }
        })
    }, [itemsRaw])

    const refresh = () => {
        qc.invalidateQueries({
            predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'notifications',
        })
    }

    return (
        <div className="space-y-8">
            <Card className="bg-white/80 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg">알림 설정</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground">
                            읽지 않음 <b className="text-foreground">{unread}</b>개
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
                            <Button
                                onClick={() => markAll.mutate()}
                                disabled={markAll.isPending || unread === 0}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                모두 읽음
                            </Button>
                        </div>
                    </div>

                    {isError && (
                        <div className="flex min-h-[160px] items-center justify-center text-red-500">
                            알림을 불러오지 못했습니다.
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
                            아직 알림이 없습니다. 활동을 시작해 보세요!
                        </div>
                    )}

                    {!isEmpty && !isLoading && !isError && (
                        <div className="rounded-xl border border-emerald-100/60 bg-white/70 dark:bg-gray-900/20">
                            <ul className="divide-y divide-emerald-100/60">
                                {rows.map((r) => (
                                    <li key={r.id} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => delOne.mutate(r.id)}
                                            disabled={delOne.isPending}
                                            aria-label="알림 삭제"
                                            className="absolute right-2 top-2 z-10 rounded-md p-1 text-emerald-700/70 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        {!r.read && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 h-2 w-2 rounded-full bg-emerald-500" />
                                        )}

                                        <div
                                            className={`pl-5 pr-10 sm:pl-5 sm:pr-10 py-4 flex items-start gap-3 transition-colors
                        ${r.read ? 'hover:bg-emerald-50/40' : 'bg-emerald-50/50 hover:bg-emerald-50/80'}`}
                                        >
                                            <div className="mt-0.5 shrink-0 grid place-items-center h-9 w-9 rounded-full bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700">
                                                {ICONS[r.title] ?? <Bell className="h-5 w-5" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-emerald-600">{r.title}</Badge>
                                                    {!r.read && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              NEW
                            </span>
                                                    )}
                                                    <span className="ml-auto text-xs text-muted-foreground">
                            {dayjs(r.createdAt).format('YYYY.MM.DD HH:mm')}
                          </span>
                                                </div>
                                                <p className={`mt-1 truncate ${r.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                                                    {r.content}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 ml-auto mt-0.5">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => markOne.mutate(r.id)}
                                                    disabled={markOne.isPending || r.read}
                                                    className="hover:bg-emerald-50"
                                                >
                                                    <Check className="mr-1.5 h-4 w-4" />
                                                    읽음
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
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
                                        disabled={page <= 1}
                                    >
                                        이전
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={rows.length < size}
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