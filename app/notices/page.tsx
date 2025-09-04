'use client';

import { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGrowNoticeAdminActions, useGrowNoticePage } from '@/hooks/GrowNotice';
import { useIsAdminProbe } from '@/hooks/useQna';
import type { Notice, PageResp } from '@/types/notice';
import { Pin, PinOff, Trash2, RefreshCcw, Plus } from 'lucide-react';

function FilledPin({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <circle cx="12" cy="7" r="4" fill="currentColor" />
            <rect x="11" y="10.5" width="2" height="6.5" rx="1" fill="currentColor" />
            <path d="M12 22 L9.5 17.5 H14.5 Z" fill="currentColor" />
        </svg>
    );
}
function OutlinePin({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <rect x="11" y="10.5" width="2" height="6.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 22 L9.5 17.5 H14.5 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );
}

export default function NoticeListPage() {
    const [page, setPage] = useState(0);
    const size = 10;

    const { data, refetch, isFetching } = useGrowNoticePage(page, size); // PageResp<Notice> | undefined
    const { data: isAdmin } = useIsAdminProbe();
    const { pinMut, delMut, createMut } = useGrowNoticeAdminActions();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const pageData: PageResp<Notice> | undefined = data;

    // 🔧 핀 토글: 링크/리스트 클릭 전파 차단
    const onTogglePin = (e: MouseEvent, n: Notice) => {
        e.preventDefault();
        e.stopPropagation();
        pinMut.mutate({ id: n.noticeId, pinned: !n.pinned });
    };

    // 🔧 삭제: 링크/리스트 클릭 전파 차단
    const onDelete = (e: MouseEvent, n: Notice) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('정말 삭제할까요?')) delMut.mutate(n.noticeId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* 상단 바 */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-emerald-900">공지사항</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            새로고침
                        </Button>
                        {isAdmin ? (
                            <Button
                                size="sm"
                                onClick={() => setShowCreate(v => !v)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                글쓰기
                            </Button>
                        ) : null}
                        <Link href="/" className="ml-2 text-emerald-700 underline underline-offset-4">
                            홈으로
                        </Link>
                    </div>
                </div>

                {/* 관리자: 간단 작성 폼(접기/펼치기) */}
                {isAdmin && showCreate ? (
                    <div className="rounded-lg border border-emerald-200 p-4 space-y-3 bg-white/70">
                        <div className="text-emerald-900 font-semibold">새 공지 작성</div>
                        <Input placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
                        <Textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => createMut.mutate({ title, content, pinned: false })}
                                disabled={!title.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                등록
                            </Button>
                            <Button
                                onClick={() => createMut.mutate({ title, content, pinned: true })}
                                disabled={!title.trim()}
                                variant="outline"
                            >
                                핀으로 등록
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* 목록 UI */}
                <div className="rounded-lg border border-emerald-200 overflow-hidden bg-white/70">
                    <ul className="divide-y divide-emerald-100">
                        {(pageData?.content ?? []).map((n: Notice) => (
                            <li
                                key={n.noticeId}
                                className={`group flex items-center gap-3 px-4 py-3 transition-colors
                  ${n.pinned ? 'bg-emerald-50 hover:bg-emerald-50' : 'bg-transparent hover:bg-white'}
                `}
                            >
                                {/* 핀 아이콘 */}
                                {n.pinned ? (
                                    <FilledPin className="h-4 w-4 text-rose-500 shrink-0" />
                                ) : (
                                    <OutlinePin className="h-4 w-4 text-gray-400 shrink-0" />
                                )}

                                {/* 제목(상세 이동) : 핀만 볼드 */}
                                <Link
                                    href={`/notices/${n.noticeId}`}
                                    className={`flex-1 truncate underline-offset-4 hover:underline
                    ${n.pinned ? 'font-semibold text-emerald-900' : 'font-normal text-emerald-900'}
                  `}
                                    title={n.title}
                                >
                                    {n.title}
                                </Link>

                                <span className="text-xs text-emerald-700/70 shrink-0">
                  {new Date(n.createdAt).toLocaleString()}
                </span>

                                {/* 관리자 액션: 수정은 제거(상세에서만), 핀/삭제만 유지 */}
                                {isAdmin ? (
                                    <div className="ml-2 flex items-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            aria-label={n.pinned ? '핀 해제' : '핀 고정'}
                                            onClick={(e) => onTogglePin(e, n)}
                                            className="h-8 w-8"
                                            title={n.pinned ? '핀 해제' : '핀 고정'}
                                        >
                                            {n.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            aria-label="삭제"
                                            onClick={(e) => onDelete(e, n)}
                                            className="h-8 w-8"
                                            title="삭제"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ) : null}
                            </li>
                        ))}

                        {(!pageData || pageData.content.length === 0) && (
                            <li className="px-4 py-10 text-center text-emerald-700/70">등록된 공지가 없습니다.</li>
                        )}
                    </ul>
                </div>

                {/* 페이지네이션 */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
                        이전
                    </Button>
                    <div className="text-sm text-emerald-800">
                        {pageData ? `${pageData.number + 1} / ${pageData.totalPages || 1}` : '...'}
                    </div>
                    <Button
                        variant="outline"
                        disabled={!!pageData && (pageData.last || pageData.totalPages === 0)}
                        onClick={() => setPage(p => p + 1)}
                    >
                        다음
                    </Button>
                </div>
            </div>
        </div>
    );
}