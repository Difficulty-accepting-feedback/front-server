'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Bell, Share2, Video } from 'lucide-react';
import NoticeCreateForm from '@/components/notice/NoticeCreateForm';
import NoticeTable from '@/components/notice/NoticeTable';
import { Button } from '@/components/ui/button';
import { useNoticeList } from '@/hooks/useNotice';

type Props = { params: { groupId: string } };

export default function NoticeGroupPage({ params }: Props) {
    const groupId = Number(params.groupId);
    const pathname = usePathname();
    const [showForm, setShowForm] = useState(false);

    // 목록 데이터
    const { data: notices = [], isLoading } = useNoticeList(groupId);

    const MAX_NOTICES = 10;
    const isLimitReached = notices.length >= MAX_NOTICES;

    const navItems = [
        { name: '대시보드', href: `/group/dashboard/${groupId}`, icon: <LayoutGrid className="h-4 w-4" /> },
        { name: '공지사항', href: `/group/notice/${groupId}`, icon: <Bell className="h-4 w-4" /> },
        { name: '자료 공유', href: `/group/share/${groupId}`, icon: <Share2 className="h-4 w-4" /> },
        { name: '화상 미팅', href: `/meeting/${groupId}`, icon: <Video className="h-4 w-4" /> },
    ];

    return (
        <div className="flex max-w-7xl mx-auto px-6 py-6 gap-8">
            {/* 왼쪽 탭(사이드바) */}
            <aside className="w-56 flex-shrink-0">
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors 
                  ${active
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'}`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* 오른쪽 메인 컨텐츠 */}
            <div className="flex-1 space-y-8">
                {/* 공지사항 목록 */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">공지사항 목록</h2>
                    <NoticeTable groupId={groupId} />
                </section>

                {/* 새 공지 추가 */}
                <section className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">새 공지 추가</h3>
                        <Button
                            onClick={() => setShowForm((prev) => !prev)}
                            disabled={isLoading || isLimitReached}
                            className="bg-emerald-700 hover:bg-emerald-800"
                        >
                            {showForm ? '작성 폼 닫기' : '공지사항 추가하기'}
                        </Button>
                    </div>

                    {isLimitReached && (
                        <p className="text-sm text-red-600 mb-4">
                            최대 {MAX_NOTICES}개의 공지만 등록할 수 있습니다.
                        </p>
                    )}

                    {showForm && !isLimitReached && <NoticeCreateForm groupId={groupId} />}
                </section>
            </div>
        </div>
    );
}
