import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';

export const dynamic = 'force-dynamic'; // 쿼리 의존 → SSG 방지

export default function Page({
                                 searchParams,
                             }: {
    searchParams: Record<string, string | undefined>;
}) {
    const paymentKey = searchParams.paymentKey ?? '';
    const orderId = searchParams.orderId ?? '';
    const amount = Number(searchParams.amount ?? '0');

    return (
        <Suspense fallback={<div>처리 중…</div>}>
            <PaymentSuccessClient paymentKey={paymentKey} orderId={orderId} amount={amount} />
        </Suspense>
    );
}