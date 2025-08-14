'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { confirmPayment } from '@/lib/payment-api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMember } from '@/hooks/useMember';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const { data: me } = useMember();

    const paymentKey = sp.get('paymentKey');
    const orderId    = sp.get('orderId');
    const amount     = Number(sp.get('amount') ?? '0');

    const [done, setDone] = useState(false);
    const [paymentId, setPaymentId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            if (!paymentKey || !orderId || !me?.memberId) return;
            try {
                const pid = await confirmPayment({
                    memberId: me.memberId,
                    paymentKey,
                    orderId,
                    amount,
                });
                setPaymentId(pid);
                setDone(true);
            } catch (e: any) {
                toast.error(e?.message ?? '결제 승인 처리 실패');
            }
        })();
    }, [paymentKey, orderId, amount, me?.memberId]);

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-white/80 dark:bg-gray-800/70">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        결제가 완료되었어요
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        주문번호: <b>{orderId ?? '-'}</b>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        승인금액: <b>₩{amount.toLocaleString()}</b>
                    </div>
                    <div className="pt-2 flex gap-2">
                        <Button onClick={() => router.push('/me/payment/history')} className="bg-emerald-600 hover:bg-emerald-700">
                            결제 내역 보기
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/me')}>
                            내 페이지로
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}