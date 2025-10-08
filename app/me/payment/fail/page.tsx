import PaymentFailClient from './PaymentFailClient';

export const dynamic = 'force-dynamic'; // 쿼리 의존 → SSG 방지

export default function Page({
                                 searchParams,
                             }: {
    searchParams: Record<string, string | undefined>;
}) {
    const code = searchParams.code ?? undefined;
    const message = searchParams.message ?? undefined;
    const orderId = searchParams.orderId ?? undefined;

    return (
        <PaymentFailClient code={code} message={message} orderId={orderId} />
    );
}