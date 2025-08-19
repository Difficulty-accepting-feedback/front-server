'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LayoutGrid, Bell, Share2, Video} from 'lucide-react';

type NavigationItem = {
    name: string;
    href: string;
    icon: typeof LayoutGrid;
    ariaLabel?: string;
};

type Props = {
    className?: string;
};

/**
 * 디자인 토큰
 * --primary: #A6E3B8 (연한 녹색: 밑줄/포커스 포인트)
 * --primary-contrast: #14532d (딥그린: 텍스트/아이콘)
 * --active-ring: rgba(20,83,45,0.3)
 */
export default function GroupNavigation({ className = '' }: Props) {
    const pathname = usePathname();

    const [groupId, setGroupId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            // TODO: sessionStorage 사용으로 교체
            const raw: any = 1; // sessionStorage.getItem('groupId');
            if (!raw) {
                setGroupId(null);
            } else {
                const parsed = Number(raw);
                setGroupId(Number.isNaN(parsed) ? null : parsed);
            }
        } catch {
            setGroupId(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const navItems: NavigationItem[] = useMemo(() => {
        if (groupId == null) return [];
        return [
            { name: 'DASHBOARD', href: `/group/dashboard/${groupId}`, icon: LayoutGrid, ariaLabel: '대시보드' },
            { name: 'NOTICE', href: `/group/notice/${groupId}`, icon: Bell, ariaLabel: '공지사항' },
            { name: 'SHARE', href: `/group/share/${groupId}`, icon: Share2, ariaLabel: '자료 공유' },
            { name: 'MEETING', href: `/create`, icon: Video, ariaLabel: '화상 회의' },
        ];
    }, [groupId]);

    if (loading) {
        return (
            <nav
                aria-label="그룹 내비게이션 로딩"
                className={`w-full bg-transparent ${className}`} // border-b 제거
                style={paletteStyle}
            >
                <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-2 py-2 sm:gap-3 sm:px-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-9 w-24 animate-pulse rounded-md bg-gray-100" />
                    ))}
                </div>
            </nav>
        );
    }

    if (groupId == null) {
        return (
            <nav
                aria-label="그룹 내비게이션"
                className={`w-full bg-transparent ${className}`} // border-b 제거
                style={paletteStyle}
            >
                <div className="mx-auto max-w-5xl px-2 py-2 sm:px-4">
                    <p className="text-sm text-gray-600">그룹 정보를 불러오는 중입니다...</p>
                </div>
            </nav>
        );
    }

    return (
        <nav
            aria-label="그룹 내비게이션"
            className={`w-full bg-transparent ${className}`} // border-b 제거
            style={paletteStyle}
        >
            {/* 스크롤 제거 버전 유지: flex-wrap */}
            <ul className="mx-auto max-w-5xl flex flex-wrap items-center gap-1 px-2 py-1 sm:gap-2 sm:px-4 sm:py-2">
                {navItems.map(({ name, href, icon: Icon, ariaLabel }) => {
                    const isActive = !!pathname && pathname.startsWith(href);
                    return (
                        <li key={href} className="min-w-0">
                            <Link
                                href={href}
                                aria-label={ariaLabel || name}
                                className={[
                                    'group relative inline-flex items-center gap-2 whitespace-normal px-3 py-2 sm:px-4 sm:py-3',
                                    'text-[var(--primary-contrast)]/75 hover:text-[var(--primary-contrast)]',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--active-ring)] rounded-md',
                                ].join(' ')}
                            >
                                <Icon
                                    size={18}
                                    className={isActive ? 'text-[var(--primary-contrast)]' : 'text-[var(--primary-contrast)]/70 group-hover:text-[var(--primary-contrast)]'}
                                />
                                <span className="text-sm font-medium tracking-wide sm:text-base">
                  {name}
                </span>

                                {/* 활성 탭 밑줄 */}
                                <span
                                    aria-hidden
                                    className={[
                                        'pointer-events-none absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full bg-[var(--primary)] transition-opacity',
                                        'sm:left-3 sm:right-3 sm:-bottom-[3px] sm:h-[3px]',
                                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                                    ].join(' ')}
                                />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

const paletteStyle: React.CSSProperties = {
    ['--primary' as any]: '#A6E3B8',
    ['--primary-contrast' as any]: '#14532d',
    ['--active-ring' as any]: 'rgba(20,83,45,0.3)',
};
