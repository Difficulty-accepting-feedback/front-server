// app/me/payment/billing/success/page.tsx
import { Suspense } from 'react';
import BillingSuccessClient from './BillingSuccessClient';

export const dynamic = 'force-dynamic';

type SP = Record<string, string | undefined>;

export default function Page({ searchParams }: { searchParams: SP }) {
    const orderId = searchParams.orderId ?? '';
    const authKey = searchParams.authKey ?? '';
    const customerKey = searchParams.customerKey ?? '';
    const amount = Number(searchParams.amount ?? '0');

    return (
        <Suspense fallback={<div>로그인 처리 중…</div>}>
            <BillingSuccessClient
                orderId={orderId}
                authKey={authKey}
                customerKey={customerKey}
                amount={amount}
            />
        </Suspense>
    );
}