'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMember } from '@/hooks/useMember';
import { autoChargeWithBillingKey, issueBillingKey } from '@/lib/payment-api';

function getErrorMessage(e: unknown) {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try { return JSON.stringify(e); } catch { return '알 수 없는 오류가 발생했습니다.'; }
}

export default function BillingSuccessClient(props: {
    orderId: string;
    authKey: string;
    customerKey: string;
    amount: number;
}) {
    const { orderId, authKey, customerKey, amount } = props;

    const router = useRouter();
    const { data: me } = useMember();
    const [busy, setBusy] = useState(false);

    const orderName = useMemo(() => `GROW Subscription #${orderId}`, [orderId]);

    useEffect(() => {
        (async () => {
            if (!me?.memberId) return; // me 로딩 대기

            if (!orderId || !authKey || !customerKey) {
                toast.error('인증 정보가 유효하지 않습니다.');
                router.replace('/me/payments');
                return;
            }

            try {
                setBusy(true);

                // 1) 빌링키 발급
                const billingKey = await issueBillingKey({
                    orderId,
                    authKey,
                    customerKey,
                });

                // 2) 첫 결제
                const idem =
                    typeof crypto !== 'undefined' && 'randomUUID' in crypto
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random()}`;

                await autoChargeWithBillingKey({
                    orderId,
                    amount,
                    billingKey,
                    customerKey,
                    orderName,
                    customerName: me.nickname ?? undefined,
                    taxFreeAmount: 0,
                    taxExemptionAmount: 0,
                    idempotencyKey: idem, // ← 쓰면 ESLint 경고도 해결
                });

                toast.success('구독 결제가 완료되었습니다.');
                router.replace('/me/payment');
            } catch (e: unknown) {
                toast.error(getErrorMessage(e));
                router.replace('/me/payment');
            } finally {
                setBusy(false);
            }
        })();
    }, [me?.memberId, orderId, authKey, customerKey, amount, orderName, router]);

    return (
        <div className="p-6 text-sm text-muted-foreground">
            {busy ? '처리 중...' : '처리 완료'}
        </div>
    );
}