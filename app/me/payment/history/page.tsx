'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchMyPayments, fetchPlans, PaymentHistoryItem, PlanResponse } from '@/lib/payment-api';
import { useMember } from '@/hooks/useMember';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function statusColor(s: string) {
    switch (s) {
        case 'DONE': return 'bg-emerald-600/15 text-emerald-700';
        case 'READY': return 'bg-gray-600/10 text-gray-700'; // (필터링으로 실제 표시되진 않음)
        case 'CANCELLED': return 'bg-red-600/15 text-red-700';
        case 'CANCEL_REQUESTED': return 'bg-amber-600/15 text-amber-700';
        case 'AUTO_BILLING_READY': return 'bg-blue-600/15 text-blue-700';
        case 'AUTO_BILLING_IN_PROGRESS': return 'bg-blue-600/15 text-blue-700';
        case 'AUTO_BILLING_APPROVED': return 'bg-emerald-600/15 text-emerald-700';
        case 'AUTO_BILLING_FAILED': return 'bg-red-600/15 text-red-700';
        case 'ABORTED': return 'bg-zinc-600/15 text-zinc-700';
        default: return 'bg-zinc-600/10 text-zinc-700';
    }
}

function statusLabel(s: string) {
    switch (s) {
        case 'DONE': return '완료';
        case 'READY': return '대기';
        case 'CANCELLED': return '취소됨';
        case 'CANCEL_REQUESTED': return '취소 요청';
        case 'AUTO_BILLING_READY': return '자동결제 대기';
        case 'AUTO_BILLING_IN_PROGRESS': return '자동결제 진행 중';
        case 'AUTO_BILLING_APPROVED': return '자동결제 승인';
        case 'AUTO_BILLING_FAILED': return '자동결제 실패';
        case 'ABORTED': return '만료됨';
        default: return s;
    }
}

export default function PaymentHistoryPage() {
    const { data: me } = useMember();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<PaymentHistoryItem[]>([]);
    const [plans, setPlans] = useState<PlanResponse[]>([]);

    useEffect(() => {
        (async () => {
            if (!me?.memberId) return;
            try {
                setLoading(true);
                const [list, planList] = await Promise.all([
                    fetchMyPayments(me.memberId),
                    fetchPlans(),
                ]);
                setItems(list);
                setPlans(planList);
            } finally {
                setLoading(false);
            }
        })();
    }, [me?.memberId]);

    // planId → Plan 매핑
    const planMap = useMemo(() => {
        const m = new Map<number, PlanResponse>();
        plans.forEach(p => m.set(p.planId, p));
        return m;
    }, [plans]);

    // ✅ READY 상태는 히스토리에서 제외
    const filteredItems = useMemo(
        () => items.filter(p => p.payStatus !== 'READY'),
        [items]
    );

    const renderTypeBadge = (planId?: number | null) => {
        const p = planId ? planMap.get(planId) : undefined;
        if (!p) return <span className="text-zinc-500">-</span>;

        const isSub = p.type === 'SUBSCRIPTION';
        const label = isSub
            ? `구독·${p.period === 'MONTHLY' ? '월간' : '연간'}`
            : '일회성';

        const cls = isSub
            ? 'border-emerald-300 text-emerald-700 bg-emerald-600/10'
            : 'border-slate-300 text-slate-700 bg-slate-600/10';

        return (
            <Badge variant="outline" className={`px-2 py-1 text-xs rounded-full ${cls}`}>
                {label}
            </Badge>
        );
    };

    const HEADERS = useMemo(
        () => ['결제ID', '주문번호', '유형', '금액', '상태', '결제수단', '최근 이력'],
        []
    );

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <Card className="bg-white/80 dark:bg-gray-800/70">
            <CardHeader>
                <CardTitle className="text-emerald-900 dark:text-emerald-200">
                    결제 내역
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-muted-foreground">
                        {HEADERS.map((h, idx) => (
                            <th key={h} className={idx === 0 ? 'py-3' : undefined}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {filteredItems.length === 0 ? (
                        <tr className="border-t">
                            <td colSpan={HEADERS.length} className="py-6 text-center text-muted-foreground">
                                표시할 결제 내역이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        filteredItems.map((p) => {
                            const last = [...(p.histories ?? [])].sort(
                                (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
                            )[0];

                            return (
                                <tr key={p.paymentId} className="border-t">
                                    <td className="py-3">{p.paymentId}</td>
                                    <td>{p.orderId}</td>
                                    <td>{renderTypeBadge(p.planId)}</td>
                                    <td>₩{(p.totalAmount ?? 0).toLocaleString('ko-KR')}</td>
                                    <td>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusColor(p.payStatus)}`}>
                        {statusLabel(p.payStatus)}
                      </span>
                                    </td>
                                    <td>{p.method ?? '-'}</td>
                                    <td className="text-muted-foreground">
                                        {last ? `${statusLabel(last.status)} • ${new Date(last.changedAt).toLocaleString('ko-KR')}` : '-'}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}