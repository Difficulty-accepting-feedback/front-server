'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Bell, Share2, Video } from 'lucide-react';

type NavigationItem = {
    name: string;
    href: string;
    icon: typeof LayoutGrid;
};

type Props = {
    groupId: number;
    className?: string;
};

export default function GroupNavigation({ groupId, className }: Props) {
    const pathname = usePathname();

    // 네비게이션 메뉴 아이템들
    const navItems: NavigationItem[] = [
        { name: '대시보드', href: `/group/dashboard/${groupId}`, icon: LayoutGrid },
        { name: '공지사항', href: `/group/notice/${groupId}`, icon: Bell },
        { name: '공유', href: `/group/share/${groupId}`, icon: Share2 },
        { name: '영상', href: `/group/video/${groupId}`, icon: Video },
    ];

    return (
        <div className={`border-b border-gray-200 ${className || ''}`}>
            <nav className="flex space-x-8">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${isActive
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300'
                            }
              `}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

