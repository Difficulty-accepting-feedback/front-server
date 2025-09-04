'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGrowNoticeAdminActions, useGrowNoticeDetail } from '@/hooks/GrowNotice';
import { useIsAdminProbe } from '@/hooks/useQna';
import {
    Pin, PinOff, Pencil, Trash2, Check, X, ArrowLeft, CalendarDays,
} from 'lucide-react';

export default function NoticeDetailPage() {
    const params = useParams<{ id: string }>();
    const id = useMemo(() => Number(params?.id), [params?.id]);
    const router = useRouter();

    const { data: notice } = useGrowNoticeDetail(Number.isFinite(id) ? id : undefined);
    const { data: isAdmin } = useIsAdminProbe();
    const { pinMut, delMut, editMut } = useGrowNoticeAdminActions();

    const [editing, setEditing] = useState(false);
    const [titleDraft, setTitleDraft] = useState('');
    const [contentDraft, setContentDraft] = useState('');

    useEffect(() => {
        if (!notice) return;
        setTitleDraft(notice.title);
        setContentDraft(notice.content);
    }, [notice]);

    if (!notice) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
                <div className="max-w-5xl mx-auto px-4 py-12">
                    <p className="text-emerald-800">해당 공지를 찾을 수 없어요.</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        이전으로
                    </Button>
                </div>
            </div>
        );
    }

    const onSave = () => {
        if (!titleDraft.trim()) return;
        editMut.mutate(
            { id: notice.noticeId, title: titleDraft, content: contentDraft },
            { onSuccess: () => setEditing(false) }
        );
    };
    const onCancel = () => { setTitleDraft(notice.title); setContentDraft(notice.content); setEditing(false); };
    const onDelete = () => {
        if (confirm('정말 삭제할까요?')) delMut.mutate(notice.noticeId, { onSuccess: () => router.push('/notices') });
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* 남는 높이까지 채우기 */}
                <div className="min-h-[calc(100dvh-8rem)] flex flex-col">
                    {/* 상단 내비 */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-800">
                            <Link href="/notices" className="inline-flex items-center hover:underline underline-offset-4">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                공지사항
                            </Link>
                            <span className="opacity-60">/</span>
                            <span className="opacity-80 truncate max-w-[60vw]">{notice.title}</span>
                        </div>
                        <Link href="/notices" className="text-emerald-700 hover:text-emerald-900 underline underline-offset-4">
                            목록으로
                        </Link>
                    </div>

                    {/* 단일 카드가 화면을 채우도록 */}
                    <Card className="border-emerald-200 bg-white/80 shadow-sm min-h-[70dvh]">
                        <CardContent className="p-5 h-full flex flex-col">
                            {/* 헤더(제목/메타/아이콘) */}
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    {editing ? (
                                        <Input
                                            value={titleDraft}
                                            onChange={(e) => setTitleDraft(e.target.value)}
                                            className="text-2xl md:text-3xl font-bold text-emerald-900 bg-white border-emerald-200"
                                            placeholder="제목을 입력하세요"
                                        />
                                    ) : (
                                        <h1 className="text-2xl md:text-3xl font-bold text-emerald-900 break-words">
                                            {notice.title}
                                        </h1>
                                    )}

                                    <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700/80">
                                        <CalendarDays className="h-4 w-4" />
                                        {new Date(notice.createdAt).toLocaleString()}
                                        {notice.pinned ? (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        고정됨
                      </span>
                                        ) : null}
                                    </div>
                                </div>

                                {isAdmin ? (
                                    <div className="flex items-center gap-1 ml-2">
                                        {!editing ? (
                                            <>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title={notice.pinned ? '핀 해제' : '핀 고정'}
                                                    aria-label={notice.pinned ? '핀 해제' : '핀 고정'}
                                                    onClick={() => pinMut.mutate({ id: notice.noticeId, pinned: !notice.pinned })}
                                                >
                                                    {notice.pinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" title="수정" aria-label="수정" onClick={() => setEditing(true)}>
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" title="삭제" aria-label="삭제" onClick={onDelete}>
                                                    <Trash2 className="h-5 w-5 text-red-600" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="icon"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    title="저장"
                                                    aria-label="저장"
                                                    onClick={onSave}
                                                >
                                                    <Check className="h-5 w-5" />
                                                </Button>
                                                <Button size="icon" variant="outline" title="취소" aria-label="취소" onClick={onCancel}>
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            {/* 구분선 */}
                            <div className="my-4 h-px bg-emerald-100" />

                            {/* 본문이 남은 높이를 채우도록 */}
                            <div className="flex-1">
                                {editing ? (
                                    <Textarea
                                        value={contentDraft}
                                        onChange={(e) => setContentDraft(e.target.value)}
                                        placeholder="내용을 입력하세요"
                                        className="h-full min-h-[270px] bg-white border-emerald-200"
                                    />
                                ) : (
                                    <div className="prose prose-emerald max-w-none whitespace-pre-wrap leading-7 min-h-[270px]">
                                        {notice.content}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}