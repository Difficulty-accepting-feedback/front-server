'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    fetchMyPayments,
    fetchPlans,
    cancelPayment,
    PaymentHistoryItem,
    PlanResponse,
} from '@/lib/payment-api';
import { useMember } from '@/hooks/useMember';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function statusColor(s: string) {
    switch (s) {
        case 'DONE': return 'bg-emerald-600/15 text-emerald-700';
        case 'READY': return 'bg-gray-600/10 text-gray-700';
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

function isCancelable(status: string) {
    return status === 'DONE' || status === 'AUTO_BILLING_APPROVED';
}

export default function PaymentHistoryPage() {
    const { data: me } = useMember();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<PaymentHistoryItem[]>([]);
    const [plans, setPlans] = useState<PlanResponse[]>([]);
    const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

    async function reload() {
        const [list, planList] = await Promise.all([fetchMyPayments(), fetchPlans()]);
        setItems(list);
        setPlans(planList);
    }

    useEffect(() => {
        (async () => {
            if (!me?.memberId) return; // 로그인 필요
            try {
                setLoading(true);
                await reload();
            } finally {
                setLoading(false);
            }
        })();
    }, [me?.memberId]);

    const planMap = useMemo(() => {
        const m = new Map<number, PlanResponse>();
        plans.forEach((p) => m.set(p.planId, p));
        return m;
    }, [plans]);

    const filteredItems = useMemo(
        () => items.filter((p) => p.payStatus !== 'READY'),
        [items]
    );

    const renderTypeBadge = (planId?: number | null) => {
        const p = planId ? planMap.get(planId) : undefined;
        if (!p) return <span className="text-zinc-500">-</span>;

        const isSub = p.type === 'SUBSCRIPTION';
        const label = isSub ? `구독·${p.period === 'MONTHLY' ? '월간' : '연간'}` : '일회성';
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
        () => ['결제ID', '주문번호', '유형', '금액', '상태', '결제수단', '관리'],
        []
    );

    const onCancel = async (p: PaymentHistoryItem) => {
        if (!me?.memberId) {
            toast.error('로그인이 필요합니다.');
            return;
        }
        if (!isCancelable(p.payStatus)) {
            toast.error('현재 상태에서는 취소할 수 없습니다.');
            return;
        }
        const amount = p.totalAmount ?? 0;
        const ok = window.confirm(
            `해당 결제를 취소할까요?\n주문번호: ${p.orderId}\n금액: ₩${amount.toLocaleString('ko-KR')}`
        );
        if (!ok) return;

        try {
            setBusyOrderId(p.orderId);
            await cancelPayment({
                orderId: p.orderId,
                cancelAmount: amount,
                cancelReason: 'USER_REQUEST',
            });
            toast.success('결제가 취소되었습니다.');
            await reload();
        } catch (e: any) {
            toast.error(e?.message ?? '결제 취소에 실패했습니다.');
        } finally {
            setBusyOrderId(null);
        }
    };

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
                <CardTitle className="text-emerald-900 dark:text-emerald-200">결제 내역</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-muted-foreground">
                        {HEADERS.map((h, idx) => (
                            <th key={h} className={idx === 0 ? 'py-3' : undefined}>
                                {h}
                            </th>
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
                                        <div className="flex items-center gap-3">
                                            {isCancelable(p.payStatus) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7"
                                                    onClick={() => onCancel(p)}
                                                    disabled={busyOrderId === p.orderId}
                                                >
                                                    {busyOrderId === p.orderId ? '취소 중…' : '결제 취소'}
                                                </Button>
                                            )}
                                        </div>
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