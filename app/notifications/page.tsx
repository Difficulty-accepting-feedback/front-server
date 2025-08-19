// app/notifications/page.tsx (혹은 현재 파일 경로에 맞게 배치)
'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Bell, RefreshCcw, Check, Trash2 } from 'lucide-react';
import {
    useNotificationList,
    useUnreadCount,
    useMarkAllRead,
    useMarkOneRead,
    useDeleteNotification,
} from '@/hooks/useNotifications';

dayjs.locale('ko');

export default function NotificationsPage() {
    // 백엔드 page=0부터, UI는 1부터
    const [page, setPage] = useState(1);
    const size = 10;

    const qc = useQueryClient();

    const { data: unread = 0 } = useUnreadCount();
    const { data, isLoading, isError } = useNotificationList(page - 1, size);
    const markAll = useMarkAllRead();
    const markOne = useMarkOneRead();
    const delOne = useDeleteNotification();

    const records = data?.items ?? [];
    const totalRecords = data?.totalElements ?? 0;

    const isEmpty = !isLoading && !isError && totalRecords === 0;

    const refresh = () => {
        qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
        qc.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    };

    return (
        <section className="min-h-[calc(100vh-160px)] bg-emerald-50/60">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <Card className="border border-emerald-100 shadow-md bg-white/80 backdrop-blur rounded-xl">
                    {/* 헤더 */}
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            {/* 아이콘(요청하신 알림 아이콘 톤) */}
                            <div className="h-9 w-9 rounded-full ring-1 ring-emerald-200 bg-emerald-50 text-emerald-600 grid place-items-center">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl sm:text-2xl text-emerald-900">알림 설정</CardTitle>
                                {/* 제목 우측에 미읽음 배지 */}
                                <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs px-2 py-1">
                  읽지 않음 {unread}개
                </span>
                            </div>
                            <CardDescription className="ml-0 sm:ml-2 text-emerald-700">
                                활동 알림을 한곳에서 관리하고, 필요하면 읽음 처리하세요.
                            </CardDescription>
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
                    </CardHeader>

                    {/* 컨텐츠 */}
                    <CardContent className="pt-2">
                        {/* 에러 */}
                        {isError && (
                            <div className="flex min-h-[200px] items-center justify-center text-red-500">
                                알림을 불러오지 못했습니다.
                            </div>
                        )}

                        {/* 로딩 */}
                        {isLoading && (
                            <div className="space-y-2">
                                <div className="h-10 rounded bg-emerald-100/40 animate-pulse" />
                                <div className="h-10 rounded bg-emerald-100/40 animate-pulse" />
                                <div className="h-10 rounded bg-emerald-100/40 animate-pulse" />
                            </div>
                        )}

                        {/* 빈 상태 */}
                        {isEmpty && !isLoading && !isError && (
                            <div className="flex min-h-[200px] flex-col items-center justify-center text-emerald-800/80">
                                <Bell className="h-8 w-8 mb-2 opacity-60" />
                                아직 알림이 없습니다. 활동을 시작해 보세요!
                            </div>
                        )}

                        {/* 테이블 (데이터가 있을 때만 렌더) */}
                        {!isEmpty && !isLoading && !isError && (
                            <DataTable
                                withTableBorder
                                withColumnBorders
                                fetching={false}
                                records={records}
                                totalRecords={totalRecords}
                                recordsPerPage={size}
                                page={page}
                                onPageChange={setPage}
                                rowClassName={(r) => (!r.read ? 'bg-emerald-50' : undefined)}
                                // 내부 empty-row는 사용하지 않기 때문에 명시적으로 끔
                                noRecordsText={undefined as unknown as string}
                                columns={[
                                    { accessor: 'id', title: '순번', width: 80 },
                                    {
                                        accessor: 'title',
                                        title: '유형',
                                        width: 160,
                                        render: (r) => <span className="font-medium text-emerald-800">{r.title}</span>,
                                    },
                                    {
                                        accessor: 'content',
                                        title: '내용',
                                        render: (r) => (
                                            <span className={!r.read ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                        {r.content}
                      </span>
                                        ),
                                    },
                                    {
                                        accessor: 'createdAt',
                                        title: '받은 시각',
                                        width: 180,
                                        render: (r) => (
                                            <span className="text-gray-600">
                        {dayjs(r.createdAt).format('YYYY.MM.DD HH:mm')}
                      </span>
                                        ),
                                    },
                                    {
                                        accessor: 'actions',
                                        title: '관리',
                                        width: 200,
                                        render: (r) => (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => markOne.mutate(r.id)}
                                                    disabled={markOne.isPending || r.read}
                                                    className="hover:bg-emerald-50"
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    읽음
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => delOne.mutate(r.id)}
                                                    disabled={delOne.isPending}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    삭제
                                                </Button>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        )}
                    </CardContent>

                    {/* 데이터 있을 때만 표기 */}
                    {!isEmpty && !isError && (
                        <CardFooter className="flex items-center justify-between text-sm text-emerald-700">
              <span>
                총 <b>{totalRecords}</b>건 · 페이지 <b>{page}</b>
              </span>
                            <span className="opacity-80">읽음/삭제는 즉시 반영됩니다.</span>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </section>
    );
}