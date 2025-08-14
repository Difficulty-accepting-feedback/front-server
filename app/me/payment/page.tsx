'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';
import { APP_URL, TOSS_CLIENT_KEY } from '@/lib/env';
import { createOrder, fetchPlans, PlanResponse } from '@/lib/payment-api';
import { useMember } from '@/hooks/useMember';

function splitBenefits(text?: string) {
    if (!text) return [];
    if (text.includes('\n')) return text.split('\n').map(s => s.trim()).filter(Boolean);
    if (text.includes('•')) return text.split('•').map(s => s.trim()).filter(Boolean);
    return text.split(',').map(s => s.trim()).filter(Boolean);
}

function getErrorMessage(e: unknown) {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try {
        return JSON.stringify(e);
    } catch {
        return '알 수 없는 오류가 발생했습니다.';
    }
}

export default function PaymentsPage() {
    const { data: me } = useMember();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<PlanResponse[]>([]);
    const [busyPlanId, setBusyPlanId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const list = await fetchPlans();
                setPlans(list);
            } catch (e: unknown) {
                toast.error(`플랜 조회 실패: ${getErrorMessage(e)}`);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const sortedPlans = useMemo(() => {
        // 페이지 미학: 월간 먼저, 그다음 연간
        return [...plans].sort((a, b) =>
            a.period === b.period ? a.amount - b.amount : a.period === 'MONTHLY' ? -1 : 1
        );
    }, [plans]);

    const handleStart = async (plan: PlanResponse) => {
        if (!me?.memberId) {
            toast.error('로그인이 필요합니다.');
            return;
        }
        if (!TOSS_CLIENT_KEY) {
            toast.error('Toss 클라이언트 키가 설정되지 않았습니다.');
            return;
        }
        try {
            setBusyPlanId(plan.planId);
            const init = await createOrder({
                memberId: me.memberId,
                planId: plan.planId,
                amount: plan.amount,
            });

            const toss = await loadTossPayments(TOSS_CLIENT_KEY);
            await toss.requestPayment('카드', {
                amount: init.amount,
                orderId: init.orderId,
                orderName: init.orderName,
                // 성공/실패 시 프론트 라우트로 이동 → success 페이지에서 /confirm 호출
                successUrl: init.successUrl,
                failUrl: init.failUrl,

                customerName: me.nickname ?? undefined,
            });
        } catch (e: unknown) {
            toast.error(getErrorMessage(e) ?? '결제 요청에 실패했습니다.');
        } finally {
            setBusyPlanId(null);
        }
    };

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Card className="bg-white/80 dark:bg-gray-800/70">
                <CardHeader>
                    <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-200">
                        구독/결제 플랜
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 text-sm text-muted-foreground">
                        토스페이먼츠를 통해 안전하게 결제됩니다.
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {sortedPlans.map((p) => {
                            const perks = splitBenefits(p.benefits);
                            const highlight = p.type === 'SUBSCRIPTION' && p.period === 'MONTHLY';

                            return (
                                <Card
                                    key={p.planId}
                                    className="relative border-2 border-emerald-100 bg-white/70 dark:bg-gray-900/40 hover:shadow-xl transition-all"
                                >
                                    {highlight && (
                                        <Badge className="absolute -top-3 left-4 bg-amber-500 text-white">
                                            인기
                                        </Badge>
                                    )}
                                    <CardHeader>
                                        <div className="flex items-baseline justify-between">
                                            <CardTitle className="text-xl text-emerald-900 dark:text-emerald-100">
                                                {p.type === 'SUBSCRIPTION' ? '정기 구독' : '일회성'}
                                                {' · '}
                                                {p.period === 'MONTHLY' ? '월간' : '연간'}
                                            </CardTitle>
                                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                                ₩{p.amount.toLocaleString()}
                                                <span className="text-sm text-muted-foreground">
                          {p.period === 'MONTHLY' ? '/월' : '/년'}
                        </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2">
                                            {perks.map((t, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-emerald-800 dark:text-emerald-200">{t}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => handleStart(p)}
                                            disabled={busyPlanId === p.planId}
                                        >
                                            {busyPlanId === p.planId ? '처리 중…' : '시작하기'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}