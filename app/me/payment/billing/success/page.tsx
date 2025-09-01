'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useMember } from '@/hooks/useMember';
import { autoChargeWithBillingKey, issueBillingKey } from '@/lib/payment-api';

function getErrorMessage(e: unknown) {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try { return JSON.stringify(e); } catch { return '알 수 없는 오류가 발생했습니다.'; }
}

export default function Page() {
    const router = useRouter();
    const sp = useSearchParams();
    const { data: me } = useMember();

    const orderId = sp.get('orderId') ?? '';
    const authKey = sp.get('authKey') ?? '';
    const customerKey = sp.get('customerKey') ?? '';
    const amount = Number(sp.get('amount') ?? '0');
    const orderName = useMemo(() => `GROW Subscription #${orderId}`, [orderId]);

    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            if (!me?.memberId) return; // 아직 me 로딩 중일 수 있음

            if (!orderId || !authKey || !customerKey) {
                toast.error('인증 정보가 유효하지 않습니다.');
                router.replace('/me/payments');
                return;
            }

            try {
                setBusy(true);
                // 1) 빌링키 발급
                const billingKey = await issueBillingKey({
                    memberId: me.memberId,
                    orderId,
                    authKey,
                    customerKey,
                });

                // 2) 첫 결제 (즉시 과금)
                const idem = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`;

                await autoChargeWithBillingKey({
                    memberId: me.memberId,
                    orderId,
                    amount,
                    billingKey,
                    customerKey,
                    orderName,
                    customerName: me.nickname ?? undefined,
                    taxFreeAmount: 0,
                    taxExemptionAmount: 0,
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