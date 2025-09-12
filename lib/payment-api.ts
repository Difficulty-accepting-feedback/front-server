import {PAYMENT_BASE_URL} from '@/lib/env';

type RsData<T> = { code: string; msg: string; data: T };

export type PlanResponse = {
    planId: number;
    type: 'SUBSCRIPTION' | 'ONE_TIME_PAYMENT';
    period: 'MONTHLY' | 'YEARLY';
    amount: number;
    benefits: string;
};

export async function fetchPlans(): Promise<PlanResponse[]> {
    const res = await fetch(`${PAYMENT_BASE_URL}/api/v1/payment/plans`, {cache: 'no-store'});
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
    const {memberId, planId, amount} = opts;
    const res = await fetch(
        `${PAYMENT_BASE_URL}/api/v1/payment/create?planId=${planId}&amount=${amount}`,
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
    const {memberId, paymentKey, orderId, amount} = opts;
    const idem = opts.idempotencyKey ?? crypto.randomUUID();
    const res = await fetch(`${PAYMENT_BASE_URL}/api/v1/payment/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Id': String(memberId),
            'Idempotency-Key': idem,
        },
        body: JSON.stringify({paymentKey, orderId, amount}),
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

export async function cancelPayment(opts: {
    memberId: number;
    orderId: string;
    cancelAmount: number;
    cancelReason?: 'USER_REQUEST' | 'SYSTEM_ERROR' | string;
}): Promise<PaymentCancelResponse> {
    const {memberId, orderId, cancelAmount, cancelReason = 'USER_REQUEST'} = opts;

    const res = await fetch(`${PAYMENT_BASE_URL}/api/v1/payment/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 백엔드가 헤더에서 memberId를 읽음
            'X-Authorization-Id': String(memberId),
        },
        credentials: 'include',
        body: JSON.stringify({
            orderId,
            cancelAmount,
            cancelReason,
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || '결제 취소 실패');
    }
    const json: RsData<PaymentCancelResponse> = await res.json();
    return json.data;
}

export type PaymentCancelResponse = {
    paymentId: number;
    status: string;
};


export async function fetchMyPayments(memberId: number): Promise<PaymentHistoryItem[]> {
    const res = await fetch(`${PAYMENT_BASE_URL}/api/v1/payment/query/member`, {
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

/** 빌링키 발급 */
export async function issueBillingKey(opts: {
    memberId: number;
    orderId: string;
    authKey: string;
    customerKey: string;
}): Promise<string> {
    const {memberId, orderId, authKey, customerKey} = opts;
    const res = await fetch(`${PAYMENT_BASE_URL}/api/v1/payment/billing/issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Id': String(memberId),
        },
        body: JSON.stringify({orderId, authKey, customerKey}),
        credentials: 'include',
    });
    if (!res.ok) throw new Error('빌링키 발급 실패');
    const json: RsData<string> = await res.json();
    return json.data; // billingKey
}

/** 빌링키로 자동결제 승인(첫 결제 포함) */
export type PaymentConfirmResponse = {
    paymentId: number;
    payStatus: string;
    customerEmail?: string | null;
    customerName?: string | null;
};

export async function autoChargeWithBillingKey(opts: {
    memberId: number;
    orderId: string;
    amount: number;
    billingKey: string;
    customerKey: string;
    orderName: string;
    customerEmail?: string;
    customerName?: string;
    taxFreeAmount?: number | null;
    taxExemptionAmount?: number | null;
    idempotencyKey?: string;
}): Promise<PaymentConfirmResponse> {
    const {
        memberId, orderId, amount, billingKey, customerKey,
        orderName, customerEmail, customerName,
        taxFreeAmount, taxExemptionAmount, idempotencyKey
    } = opts;

    const idem = idempotencyKey ?? (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

    const res = await fetch(`${PAYMENT_BASE_URL}/api/v1/payment/billing/charge`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization-Id': String(memberId),
            'Idempotency-Key': idem,
        },
        body: JSON.stringify({
            billingKey, customerKey, amount, orderId, orderName,
            customerEmail, customerName, taxFreeAmount: taxFreeAmount ?? 0,
            taxExemptionAmount: taxExemptionAmount ?? 0,
        }),
        credentials: 'include',
    });
    if (!res.ok) throw new Error('자동결제 승인 실패');
    const json: RsData<PaymentConfirmResponse> = await res.json();
    return json.data;
}