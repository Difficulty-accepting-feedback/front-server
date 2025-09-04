'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';
import { useGrowPinnedNotices } from '@/hooks/GrowNotice';
import type { Notice } from '@/types/notice';

type Props = {
    /** 한 슬라이드가 머무는 시간(ms) */
    intervalMs?: number;
    /** 공지가 0건이어도 바를 보여줄지 */
    showWhenEmpty?: boolean;
    /** 공지 0건일 때 표시할 희미한 문구 */
    emptyText?: string;
};

export default function AnnouncementTicker({
                                               intervalMs = 4000,
                                               showWhenEmpty = true,
                                               emptyText = '',
                                           }: Props) {
    const { data: notices = [] } = useGrowPinnedNotices(10);
    const hasItems = notices.length > 0;

    // 2개 이상일 때만 무한 루프용으로 첫 항목 복제
    const slides: Notice[] = useMemo(
        () => (hasItems && notices.length > 1 ? [...notices, notices[0]] : notices),
        [hasItems, notices]
    );

    const [idx, setIdx] = useState(0);
    const [animate, setAnimate] = useState(true);
    const [rowH, setRowH] = useState(24); // px: 한 줄 높이(텍스트/아이콘에 맞춰 고정)
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // 행 높이 측정(픽셀) → 어떤 폰트/환경에서도 정확
    useEffect(() => {
        const m = () => {
            const v = viewportRef.current;
            if (!v) return;
            // h-6 = 24px 에 가깝지만, 실제 렌더값을 신뢰
            const h = v.clientHeight || 24;
            setRowH(h);
        };
        m();
        const ro = new ResizeObserver(m);
        if (viewportRef.current) ro.observe(viewportRef.current);
        window.addEventListener('resize', m);
        return () => {
            window.removeEventListener('resize', m);
            ro.disconnect();
        };
    }, []);

    // 자동 슬라이드 (2건 이상일 때만)
    useEffect(() => {
        if (notices.length < 2) return;
        const t = setInterval(() => setIdx((i) => i + 1), intervalMs);
        return () => clearInterval(t);
    }, [notices.length, intervalMs]);

    // 마지막(복제)까지 이동 → transitionend에서 0으로 점프
    useEffect(() => {
        const el = trackRef.current;
        if (!el || notices.length < 2) return;
        const onEnd = () => {
            if (idx === slides.length - 1) {
                setAnimate(false);
                setIdx(0);
                // 다음 프레임에 트랜지션 되살려 깜빡임 제거
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => setAnimate(true))
                );
            }
        };
        el.addEventListener('transitionend', onEnd);
        return () => el.removeEventListener('transitionend', onEnd);
    }, [idx, slides.length, notices.length]);

    if (!hasItems && !showWhenEmpty) return null;

    const translateY = -(idx * rowH); // px 단위 이동

    return (
        <div className="w-full bg-emerald-50/80 backdrop-blur-sm border-b border-emerald-100 text-emerald-900">
            <div className="mx-auto max-w-7xl h-12 px-4 flex items-center gap-3">
                <Megaphone className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden />

                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-semibold leading-none shrink-0">
          공지사항
        </span>

                {/* 뷰포트: 한 줄 높이 고정(줄바꿈/겹침 방지) */}
                <div
                    ref={viewportRef}
                    className="relative flex-1 min-w-0 h-6 overflow-hidden"
                    aria-live="polite"
                >
                    <div
                        ref={trackRef}
                        className={`absolute inset-0 will-change-transform ${animate ? 'transition-transform duration-500 ease-out' : ''}`}
                        style={{ transform: `translateY(${translateY}px)` }}
                    >
                        {hasItems ? (
                            slides.map((n, i) => (
                                <Link
                                    key={`${n.noticeId}-${i}`}
                                    href={`/notices/${n.noticeId}`}
                                    className="block h-6 leading-6 flex items-center"
                                    title={n.title}
                                >
                  <span className="truncate text-sm md:text-base font-medium">
                    {n.title}
                  </span>
                                </Link>
                            ))
                        ) : (
                            <div className="h-6 leading-6 flex items-center text-sm text-emerald-800/50">
                                {emptyText}
                            </div>
                        )}
                    </div>
                </div>

                <Link
                    href="/notices"
                    className="group relative inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium leading-none"
                >
                    더보기
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    <span
                        aria-hidden
                        className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-emerald-700 transition-all duration-200 group-hover:w-full"
                    />
                </Link>
            </div>
        </div>
    );
}