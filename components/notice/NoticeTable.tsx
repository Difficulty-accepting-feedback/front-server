'use client';

import { useMemo, useState } from 'react';
import { DataTable } from 'mantine-datatable';
import { Button } from '@/components/ui/button';
import { useUpdateNotices, useDeleteNotice } from '@/hooks/useNotice';
import type { NoticeResponse, NoticeUpdateRequest } from '@/types/notice';
import { Pin, Edit, Trash2, Check, X } from 'lucide-react';

// ───────────────────── 타입 정의 ─────────────────────
type EditableRow = NoticeResponse & {
    _editing?: boolean;
    _draftContent?: string;
    _draftPinned?: boolean;
};

interface NoticeTableProps {
    notices: NoticeResponse[];
    groupId: number;
}

// ───────────────────── 컴포넌트 ─────────────────────
export default function NoticeTable({ notices, groupId }: NoticeTableProps) {
    /* 1) 외부 데이터 → 로컬 rows 동기화 */
    const [rows, setRows] = useState<EditableRow[]>([]);
    useMemo(() => {
        setRows(
            notices.map((n) => ({
                ...n,
                _editing: false,
                _draftContent: n.content,
                _draftPinned: n.isPinned,
            })),
        );
    }, [notices]);

    /* 2) API 훅 (비즈니스 로직 유지) */
    const updateNoticesMutation = useUpdateNotices(groupId);
    const deleteNoticeMutation = useDeleteNotice(groupId);

    /* 3) 편집·삭제 로직 */
    const toggleEdit = (id: number, on: boolean) =>
        setRows((prev) =>
            prev.map((r) =>
                r.noticeId === id
                    ? on
                        ? { ...r, _editing: true }
                        : {
                            ...r,
                            _editing: false,
                            _draftContent: r.content,
                            _draftPinned: r.isPinned,
                        }
                    : r,
            ),
        );

    const updateDraft = (id: number, patch: Partial<EditableRow>) =>
        setRows((prev) => prev.map((r) => (r.noticeId === id ? { ...r, ...patch } : r)));

    const saveRow = async (id: number) => {
        const row = rows.find((r) => r.noticeId === id);
        if (!row || !row._editing) return;

        const body: NoticeUpdateRequest = {
            noticeId: row.noticeId,
            content: row._draftContent || row.content,
            isPinned: row._draftPinned ?? row.isPinned,
        };

        await updateNoticesMutation.mutateAsync([body]);
        toggleEdit(id, false);
    };

    const removeOne = async (id: number) => {
        if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
        await deleteNoticeMutation.mutateAsync(id);
    };

    /* 4) 고정 공지 먼저 정렬 */
    const sortedRows = useMemo(() => {
        return [...rows].sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
    }, [rows]);

    /* 5) 빈 상태 UI */
    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Pin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    아직 공지사항이 없습니다
                </h3>
                <p className="text-gray-500 text-center">
                    첫 번째 공지사항을 작성해서
                    <br />
                    중요한 정보를 공유해보세요.
                </p>
            </div>
        );
    }

    // ───────────────────── 테이블 ─────────────────────
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <DataTable
                verticalSpacing="md"
                horizontalSpacing="md"
                records={sortedRows}
                columns={[
                    {
                        accessor: 'content',
                        title: '공지 내용',
                        render: (r) =>
                            r._editing ? (
                                <textarea
                                    value={r._draftContent}
                                    onChange={(e) =>
                                        updateDraft(r.noticeId, { _draftContent: e.target.value })
                                    }
                                    className="w-full min-h-[90px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow"
                                    placeholder="공지 내용을 입력하세요..."
                                />
                            ) : (
                                <div className="flex items-start gap-2">
                                    {r.isPinned && (
                                        <Pin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                                    )}
                                    <p className="whitespace-pre-wrap break-words text-gray-800 leading-relaxed">
                                        {r.content}
                                    </p>
                                </div>
                            ),
                    },
                    {
                        accessor: 'isPinned',
                        title: '상태',
                        width: 110,
                        textAlign: 'center',
                        render: (r) =>
                            r._editing ? (
                                <label className="inline-flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={!!r._draftPinned}
                                        onChange={(e) =>
                                            updateDraft(r.noticeId, { _draftPinned: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium text-green-700 group-hover:text-green-800">
                    고정
                  </span>
                                </label>
                            ) : (
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        r.isPinned
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                  {r.isPinned && <Pin className="w-3 h-3" />}
                                    {r.isPinned ? '고정됨' : '일반'}
                </span>
                            ),
                    },
                    {
                        accessor: 'actions',
                        title: '작업',
                        width: 180,
                        textAlign: 'center',
                        render: (r) => (
                            <div className="flex items-center justify-center gap-1">
                                {!r._editing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleEdit(r.noticeId, true)}
                                            disabled={
                                                updateNoticesMutation.isPending ||
                                                deleteNoticeMutation.isPending
                                            }
                                            className="gap-1 text-green-600 hover:text-green-700"
                                        >
                                            <Edit className="w-3 h-3" />
                                            편집
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeOne(r.noticeId)}
                                            disabled={
                                                deleteNoticeMutation.isPending ||
                                                updateNoticesMutation.isPending
                                            }
                                            className="gap-1 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            {deleteNoticeMutation.isPending ? '삭제중…' : '삭제'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => saveRow(r.noticeId)}
                                            disabled={
                                                updateNoticesMutation.isPending ||
                                                !r._draftContent?.trim()
                                            }
                                            className="gap-1 text-green-600 hover:text-green-700"
                                        >
                                            <Check className="w-3 h-3" />
                                            {updateNoticesMutation.isPending ? '저장중…' : '저장'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleEdit(r.noticeId, false)}
                                            disabled={updateNoticesMutation.isPending}
                                            className="gap-1 text-gray-600 hover:text-gray-700"
                                        >
                                            <X className="w-3 h-3" />
                                            취소
                                        </Button>
                                    </>
                                )}
                            </div>
                        ),
                    },
                ]}
                rowClassName={(r) =>
                    r.isPinned
                        ? 'bg-green-50 border-l-4 border-green-400 hover:bg-green-100 transition-colors'
                        : 'hover:bg-gray-50 transition-colors'
                }
                noRecordsText="공지사항이 없습니다."
                minHeight={150}
                striped={false}
                highlightOnHover
                withTableBorder={false}
                withColumnBorders={false}
            />
        </div>
    );
}
