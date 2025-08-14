import { PAYMENT_BASE_URL } from '@/lib/env';

type RsData<T> = { code: string; msg: string; data: T };

export type PlanResponse = {
    planId: number;
    type: 'SUBSCRIPTION' | 'ONE_TIME_PAYMENT';
    period: 'MONTHLY' | 'YEARLY';
    amount: number;
    benefits: string;
};

export async function fetchPlans(): Promise<PlanResponse[]> {
    const res = await fetch(`${PAYMENT_BASE_URL}/api/plans`, { cache: 'no-store' });
    if (!res.ok) throw new Error('플랜 조회 실패');
    const json: RsData<PlanResponse[]> = await res.json();
    return json.data;
}

export type PaymentInitResponse = {
    orderId: string;
    amount: number;
    orderName: string;
    successUrl: string;
    failUrl: string;
    planId: number;
    type: 'SUBSCRIPTION' | 'ONE_TIME_PAYMENT';
    period: 'MONTHLY' | 'YEARLY';
};

export async function createOrder(opts: {
    memberId: number;
    planId: number;
    amount: number;
}): Promise<PaymentInitResponse> {
    const { memberId, planId, amount } = opts;
    const res = await fetch(
        `${PAYMENT_BASE_URL}/api/payments/create?planId=${planId}&amount=${amount}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 게이트웨이 도입 전이므로 직접 헤더로 멤버ID 전달
                'X-Authorization-Id': String(memberId),
            },
            credentials: 'include',
        }
    );
    if (!res.ok) throw new Error('주문 생성 실패');
    const json: RsData<PaymentInitResponse> = await res.json();
    return json.data;
}

export async function confirmPayment(opts: {
    memberId: number;
    paymentKey: string;
    orderId: string;
    amount: number;
    idempotencyKey?: string;
}): Promise<number> {
    const { memberId, paymentKey, orderId, amount } = opts;
    const idem = opts.idempotencyKey ?? crypto.randomUUID();
    const res = await fetch(`${PAYMENT_BASE_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Id': String(memberId),
            'Idempotency-Key': idem,
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
        credentials: 'include',
    });
    if (!res.ok) throw new Error('결제 승인 실패');
    const json: RsData<number> = await res.json();
    return json.data; // paymentId
}

export type PaymentHistoryItem = {
    paymentId: number;
    memberId: number;
    planId: number;
    orderId: string;
    payStatus: string;
    method: string | null;
    totalAmount: number;
    histories: { status: string; changedAt: string; reasonDetail: string | null }[];
};

export async function fetchMyPayments(memberId: number): Promise<PaymentHistoryItem[]> {
    const res = await fetch(`${PAYMENT_BASE_URL}/api/payments/query/member`, {
        headers: {
            memberId: String(memberId),
            'X-Authorization-Id': String(memberId),
        },
        credentials: 'include',
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('결제 내역 조회 실패');
    const json: RsData<PaymentHistoryItem[]> = await res.json();
    return json.data;
}