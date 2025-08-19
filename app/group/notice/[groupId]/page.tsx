'use client';

import { use } from 'react';
import { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import NoticeCreateForm from '@/components/notice/NoticeCreateForm';
import NoticeTable from '@/components/notice/NoticeTable';
import GroupNavigation from '@/components/navigation/GroupNavigation';
import { Button } from '@/components/ui/button';
import { useNoticeList } from '@/hooks/useNotice';

type Props = {
    params: Promise<{ groupId: string }>; // Promise 타입으로 변경
};

export default function NoticeGroupPage({ params }: Props) {
    const resolvedParams = use(params);
    const groupId = Number(resolvedParams.groupId);
    const [showForm, setShowForm] = useState(false);

    // 공지사항 목록 조회 - 에러가 있어도 페이지는 렌더링됨
    const { data: notices = [], isLoading, error, refetch } = useNoticeList(groupId);

    const MAX_NOTICES = 10;
    const isLimitReached = notices.length >= MAX_NOTICES;
    const hasError = !!error; // boolean으로 변환

    // 공지사항 생성 폼 토글 함수
    const handleToggleForm = () => {
        setShowForm(!showForm);
    };

    // 공지사항 생성 완료 후 폼 닫기
    const handleCreateSuccess = () => {
        setShowForm(false);
    };

    // 공지사항 다시 불러오기
    const handleRetry = () => {
        refetch();
    };

    // 공지사항 영역 렌더링 함수
    const renderNoticeSection = () => {
        // 로딩 중일 때
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            );
        }

        // 에러가 있을 때
        if (hasError) {
            return (
                <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        공지사항을 불러오는데 실패했습니다.
                    </h3>
                    {error && (
                        <p className="mt-1 text-sm text-gray-500">
                            {error.message}
                        </p>
                    )}
                    <div className="mt-6">
                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            className="inline-flex items-center"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            다시 시도
                        </Button>
                    </div>
                </div>
            );
        }

        // 공지사항이 없을 때
        if (notices.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        📢
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        등록된 공지사항이 없습니다
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        첫 번째 공지사항을 작성해보세요!
                    </p>
                </div>
            );
        }

        // 공지사항 목록이 있을 때
        return <NoticeTable notices={notices} />;
    };

    return (
        <div className="container mx-auto p-6">
            {/* 네비게이션 */}
            <GroupNavigation groupId={groupId} className="mb-8" />

            {/* 공지사항 섹션 */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-900">공지사항</h1>
                        <div className="flex items-center space-x-4">
                            {isLimitReached && (
                                <span className="text-sm text-amber-600">
                  최대 {MAX_NOTICES}개의 공지만 등록할 수 있습니다.
                </span>
                            )}
                            <Button
                                onClick={handleToggleForm}
                                disabled={isLimitReached}
                                className={isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                                {showForm ? '취소' : '공지 작성'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* 공지사항 생성 폼 */}
                    {showForm && (
                        <div className="mb-6">
                            <NoticeCreateForm
                                groupId={groupId}
                                onSuccess={handleCreateSuccess}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    )}

                    {/* 공지사항 목록 */}
                    {renderNoticeSection()}
                </div>
            </div>
        </div>
    );
}
