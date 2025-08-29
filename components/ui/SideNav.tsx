'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Home, BookOpen, Palette, Users, LayoutDashboard,
    CreditCard, ShoppingCart, Coins, Settings, Bell, ChevronDown, Brain
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {useAuth} from "@/hooks/useAuth";

type Item = {
    href: string
    label: string
    icon: any
    ready?: boolean
    tag?: 'new' | 'beta'
}

const GROUPS: { key: string; title: string; items: Item[] }[] = [
    {
        key: 'home',
        title: 'HOME',
        items: [
            { href: '/me', label: '홈', icon: Home, ready: true },
            { href: '/me/study', label: '스터디', icon: BookOpen, ready: false },
            { href: '/me/hobby', label: '취미', icon: Palette, ready: false },
            { href: '/me/mentoring', label: '멘토링', icon: Users, ready: false },
            { href: '/me/dashboard', label: '대시보드', icon: LayoutDashboard, ready: false, tag: 'beta' },
            { href: '/me/ai', label: 'AI 코칭', icon: Brain, ready: false },
        ],
    },
    {
        key: 'billing',
        title: '결제 관리',
        items: [
            { href: '/me/payment', label: '결제 관리', icon: CreditCard, ready: true },
            { href: '/me/payment/history', label: '결제 내역', icon: ShoppingCart, ready: true },
            { href: '/me/points', label: '포인트', icon: Coins, ready: true },
        ],
    },
    {
        key: 'settings',
        title: '설정',
        items: [
            { href: '/me/account', label: '계정 정보', icon: Settings, ready: true },
            { href: '/me/notifications', label: '알림 설정', icon: Bell, ready: true },
        ],
    },
]

export default function SideNav() {
    const pathname = usePathname()
    const { me } = useAuth()
    const initials = useMemo(() => (me?.nickname?.[0] ?? 'G').toUpperCase(), [me?.nickname])

    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
        home: false,
        billing: false,
        settings: false,
    })

    return (
        <div className="rounded-2xl border bg-white/70 dark:bg-gray-900/50 shadow-sm backdrop-blur-md p-4 space-y-8">
            {/* 프로필 */}
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-emerald-200/60 dark:ring-emerald-800/60">
                    <AvatarImage src={me?.profileImage ?? ''} alt={me?.nickname ?? 'User'} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <div className="font-semibold truncate">{me?.nickname ?? '게스트'}</div>
                    <div className="text-xs text-muted-foreground">{me ? 'GROW 회원' : '로그인 필요'}</div>
                </div>
            </div>

            {/* 그룹 네비 */}
            <div className="space-y-6">
                {GROUPS.map((g) => (
                    <section key={g.key} className="space-y-1.5">
                        <button
                            type="button"
                            onClick={() => setCollapsed((s) => ({ ...s, [g.key]: !s[g.key] }))}
                            className="group flex w-full items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide"
                            aria-expanded={!collapsed[g.key]}
                        >
                            <span>{g.title}</span>
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform duration-200',
                                    collapsed[g.key] ? '-rotate-90' : ''
                                )}
                            />
                        </button>

                        <ul
                            className={cn(
                                'space-y-0.5 overflow-hidden transition-[max-height,opacity] duration-300',
                                collapsed[g.key] ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'
                            )}
                        >
                            {g.items.map((item) => {
                                const active = pathname === item.href
                                const Icon = item.icon
                                const disabled = !item.ready

                                return (
                                    <li key={item.href}>
                                        {disabled ? (
                                            // 준비중: 배경/테두리 없이 평평하게
                                            <div
                                                className="relative flex items-center gap-3 px-2 py-2 text-sm text-gray-400 cursor-not-allowed select-none"
                                                title="준비 중"
                                                aria-disabled
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                                {item.tag && <Tag label={item.tag} />}
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                aria-current={active ? 'page' : undefined}
                                                className={cn(
                                                    // 기본: 평평(배경/테두리 X), 텍스트만
                                                    'relative flex items-center gap-3 px-2 py-2 text-sm outline-none transition-colors',
                                                    'text-gray-700 dark:text-gray-200 hover:text-emerald-700',
                                                    // 활성: pill 배경 + 왼쪽 인디케이터만 적용
                                                    active &&
                                                    'rounded-lg bg-emerald-100/70 text-emerald-900 dark:bg-emerald-900/30',
                                                    active &&
                                                    'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-[3px] before:rounded-full before:bg-emerald-500 before:opacity-100'
                                                )}
                                            >
                                                <Icon className={cn('h-4 w-4 shrink-0', active && 'scale-110')} />
                                                <span className="truncate">{item.label}</span>
                                                {item.tag && <Tag label={item.tag} />}
                                            </Link>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    )
}

function Tag({ label }: { label: 'new' | 'beta' }) {
    const text = label === 'new' ? 'NEW' : 'BETA'
    return (
        <Badge
            variant="secondary"
            className={cn(
                'ml-auto h-5 px-2 text-[10px] rounded-full',
                label === 'new'
                    ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            )}
        >
            {text}
        </Badge>
    )
}