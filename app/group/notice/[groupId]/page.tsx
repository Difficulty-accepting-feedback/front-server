'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import NoticeCreateForm from '@/components/notice/NoticeCreateForm';
import NoticeTable from '@/components/notice/NoticeTable';
import GroupNavigation from '@/components/navigation/GroupNavigation';
import { Button } from '@/components/ui/button';
import { useNoticeList } from '@/hooks/useNotice';

export default function NoticeGroupPage() {
    // 세션 스토리지에서 groupId 관리
    const [groupId, setGroupId] = useState<number | null>(null);
    const [groupIdError, setGroupIdError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // TODO 세션 스토리지 사용
            const raw: any = 1; // sessionStorage.getItem('groupId');
            if (!raw) {
                setGroupId(null);
                setGroupIdError('세션에 groupId가 없습니다.');
                return;
            }
            const parsed = Number(raw);
            if (Number.isNaN(parsed)) {
                setGroupId(null);
                setGroupIdError('세션의 groupId가 올바른 숫자가 아닙니다.');
                return;
            }
            setGroupId(parsed);
            setGroupIdError(null);
        } catch (e) {
            setGroupId(null);
            setGroupIdError('groupId를 불러오는 중 오류가 발생했습니다.');
        }
    }, []);

    // groupId가 준비된 경우에만 공지사항 훅 사용
    const { data: notices = [], isLoading, error, refetch } = useNoticeList(groupId ?? 0);

    const MAX_NOTICES = 10;
    const isLimitReached = useMemo(() => notices.length >= MAX_NOTICES, [notices]);
    const hasError = !!error;

    const [showForm, setShowForm] = useState(false);
    const handleToggleForm = () => setShowForm((v) => !v);
    const handleCreateSuccess = () => setShowForm(false);
    const handleRetry = () => refetch();

    // groupId 로딩/에러 처리
    if (groupId === null) {
        return (
            <div className="w-full">
                <div className="mx-auto w-full max-w-5xl px-4">
                    <GroupNavigation className="mb-4 pl-4" />
                    <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-white p-6">
                        {groupIdError ? (
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle size={18} />
                                <span className="text-sm">{groupIdError}</span>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-600">그룹 정보를 불러오는 중입니다...</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 실제 렌더
    return (
        <div className="w-full">
            {/* 페이지 너비를 제한하고 중앙 정렬 */}
            <div className="mx-auto w-full max-w-5xl px-4">
                <GroupNavigation className="mb-4 pl-4" />

                {/* 헤더 영역: 제목 좌측, 우측에 버튼들 */}
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">공지사항</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleRetry}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            새로고침
                        </Button>
                        <Button onClick={handleToggleForm} disabled={isLimitReached}>
                            {showForm ? '닫기' : '공지 작성'}
                        </Button>
                    </div>
                </div>

                {/* 본문 콘텐츠 래퍼: 중앙 정렬 */}
                <div className="flex w-full justify-center">
                    {/* 중앙 컨텐츠 컨테이너: 폼과 테이블 공통으로 중앙 배치 */}
                    <div className="w-full max-w-3xl">
                        {/* 공지 작성 폼 */}
                        {showForm && (
                            <div className="mb-6">
                                <NoticeCreateForm
                                    groupId={groupId}
                                    onSuccess={handleCreateSuccess}
                                    // 필요 시 내부 폭 조정: className="w-full"
                                />
                            </div>
                        )}

                        {/* 로딩 상태 */}
                        {isLoading && (
                            <div className="flex items-center justify-center rounded-lg border bg-white p-6 text-sm text-gray-600">
                                공지사항을 불러오는 중입니다...
                            </div>
                        )}

                        {/* 에러 상태 */}
                        {hasError && !isLoading && (
                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-red-700">
                                    <AlertCircle size={18} />
                                    <span className="font-medium">공지사항을 불러오지 못했습니다.</span>
                                </div>
                                <p className="mb-3 text-sm text-red-700/80">{String(error?.message ?? '')}</p>
                                <Button variant="destructive" onClick={handleRetry}>
                                    다시 시도
                                </Button>
                            </div>
                        )}

                        {/* 정상 상태 */}
                        {!isLoading && !hasError && (
                            <>
                                {notices.length === 0 ? (
                                    <div className="flex items-center justify-center rounded-lg border bg-white p-10 text-gray-600">
                                        첫 번째 공지사항을 작성해보세요!
                                    </div>
                                ) : (
                                    <div className="rounded-lg border bg-white p-2 sm:p-3">
                                        {/* 중앙 정렬: 테이블도 동일 컨테이너 안에서 가운데 */}
                                        <NoticeTable groupId={groupId} notices={[]} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
