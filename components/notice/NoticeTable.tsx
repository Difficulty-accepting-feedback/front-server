'use client';

import { useMemo, useState } from 'react';
import { DataTable } from 'mantine-datatable';
import { Button } from '@/components/ui/button';
import type { NoticeResponse, NoticeUpdateRequest } from '@/types/notice';

// 더미 데이터 (API 없이 UI 테스트용)
const dummyData: NoticeResponse[] = [
    { noticeId: 1, content: '📌 상단 고정된 중요한 공지입니다.', isPinned: true },
    { noticeId: 2, content: '정기 모임은 매주 수요일 오후 7시입니다.', isPinned: false },
    { noticeId: 3, content: '스터디 과제는 금요일까지 업로드 바랍니다.', isPinned: false },
];

type EditableRow = NoticeResponse & {
    _editing?: boolean;
    _draftContent?: string;
    _draftPinned?: boolean;
};

export default function NoticeTable({ groupId }: { groupId: number }) {
    // 📌 현재는 더미 데이터를 직접 사용
    const [rows, setRows] = useState<EditableRow[]>([]);

    useMemo(() => {
        // 원래는 API 결과(data) 대신 dummyData를 사용
        setRows(
            dummyData.map((r) => ({
                ...r,
                _editing: false,
                _draftContent: r.content,
                _draftPinned: r.isPinned,
            }))
        );
    }, []);

    const toggleEdit = (noticeId: number, on: boolean) => {
        setRows((prev) => prev.map((r) => (r.noticeId === noticeId ? { ...r, _editing: on } : r)));
    };

    const updateDraft = (noticeId: number, patch: Partial<EditableRow>) => {
        setRows((prev) => prev.map((r) => (r.noticeId === noticeId ? { ...r, ...patch } : r)));
    };

    const saveAll = () => {
        console.log('저장할 데이터:', rows);
    };

    const removeOne = (noticeId: number) => {
        setRows((prev) => prev.filter((r) => r.noticeId !== noticeId));
    };

    return (
        <div className="space-y-4">

            <DataTable
                withTableBorder
                withColumnBorders
                records={rows}
                rowClassName={(r) =>
                    r.isPinned ? 'bg-yellow-50 font-medium' : undefined // 📌 상단 고정 강조 스타일
                }
                columns={[
                    { accessor: 'noticeId', title: 'ID', width: 80 },
                    {
                        accessor: 'content',
                        title: '내용',
                        render: (r) =>
                            r._editing ? (
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={r._draftContent ?? ''}
                                    onChange={(e) => updateDraft(r.noticeId, { _draftContent: e.target.value })}
                                />
                            ) : (
                                <span>
                  {r.isPinned && '📌 '} {/* 고정 아이콘 */}
                                    {r.content}
                </span>
                            ),
                    },
                    {
                        accessor: 'isPinned',
                        title: '고정 여부',
                        width: 100,
                        render: (r) => (r.isPinned ? '예' : '아니오'),
                    },
                    {
                        accessor: 'actions',
                        title: '액션',
                        width: 220,
                        render: (r) => (
                            <div className="flex gap-2">
                                {!r._editing ? (
                                    <Button size="sm" onClick={() => toggleEdit(r.noticeId, true)}>
                                        편집
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="secondary" onClick={() => toggleEdit(r.noticeId, false)}>
                                        취소
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeOne(r.noticeId)}
                                >
                                    삭제
                                </Button>
                            </div>
                        ),
                    },
                ]}
                noRecordsText={
                    <div className="py-10 text-center">
                        <p className="text-gray-600">아직 공지사항이 없습니다.</p>
                        <p className="mt-1 text-sm text-gray-500">첫 공지를 생성해 보세요.</p>
                    </div>
                }
            />
        </div>
    );
}
