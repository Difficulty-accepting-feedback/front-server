'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { confirmPayment } from '@/lib/payment-api';

export default function PaymentSuccessClient({
                                                 paymentKey,
                                                 orderId,
                                                 amount,
                                             }: {
    paymentKey: string;
    orderId: string;
    amount: number;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            if (!paymentKey || !orderId || !amount) {
                toast.error('결제 인증 정보가 유효하지 않습니다.');
                router.replace('/me/payment');
                return;
            }
            try {
                setBusy(true);
                await confirmPayment({ paymentKey, orderId, amount });
                toast.success('결제가 완료되었습니다.');
                router.replace('/me/payment');
            } catch (e: any) {
                const msg = e?.message ?? '결제 승인에 실패했습니다.';
                router.replace(`/me/payment/fail?message=${encodeURIComponent(msg)}&orderId=${encodeURIComponent(orderId)}`);
            } finally {
                setBusy(false);
            }
        })();
    }, [paymentKey, orderId, amount, router]);

    return <div className="p-6 text-sm text-muted-foreground">{busy ? '처리 중…' : '완료'}</div>;
}