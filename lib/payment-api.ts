import { PAYMENT_BASE_URL } from '@/lib/env';

type RsData<T> = { code: string; msg: string; data: T };

export type PlanResponse = {
    planId: number;
    type: 'SUBSCRIPTION' | 'ONE_TIME_PAYMENT';
    period: 'MONTHLY' | 'YEARLY';
    amount: number;
    benefits: string;
};

// 공통 fetch 래퍼: 항상 쿠키 전송, JSON 헤더는 body 있을 때만
async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const hasBody = typeof init.body !== 'undefined';
    const headers = new Headers(init.headers ?? {});
    if (hasBody && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const res = await fetch(`${PAYMENT_BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: 'include', // ✅ 게이트웨이로 쿠키 전송
        cache: init.cache ?? 'no-store',
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `API 요청 실패: ${path}`);
    }
    return (await res.json()) as T;
}

export async function fetchPlans(): Promise<PlanResponse[]> {
    const json = await apiFetch<RsData<PlanResponse[]>>('/api/v1/payment/plans', { method: 'GET' });
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
    planId: number;
    amount: number;
}): Promise<PaymentInitResponse> {
    const { planId, amount } = opts;
    const json = await apiFetch<RsData<PaymentInitResponse>>(
        `/api/v1/payment/create?planId=${planId}&amount=${amount}`,
        { method: 'POST' }
    );
    return json.data;
}

export async function confirmPayment(opts: {
    paymentKey: string;
    orderId: string;
    amount: number;
    idempotencyKey?: string;
}): Promise<number> {
    const { paymentKey, orderId, amount, idempotencyKey } = opts;
    const idem = idempotencyKey ?? crypto.randomUUID();
    const json = await apiFetch<RsData<number>>('/api/v1/payment/confirm', {
        method: 'POST',
        headers: { 'Idempotency-Key': idem }, // ✅ 멱등키만 유지
        body: JSON.stringify({ paymentKey, orderId, amount }),
    });
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

export async function fetchMyPayments(): Promise<PaymentHistoryItem[]> {
    const json = await apiFetch<RsData<PaymentHistoryItem[]>>('/api/v1/payment/query/member', {
        method: 'GET',
    });
    return json.data;
}

export type PaymentCancelResponse = { paymentId: number; status: string };

export async function cancelPayment(opts: {
    orderId: string;
    cancelAmount: number;
    cancelReason?: 'USER_REQUEST' | 'SYSTEM_ERROR' | string;
}): Promise<PaymentCancelResponse> {
    const { orderId, cancelAmount, cancelReason = 'USER_REQUEST' } = opts;
    const json = await apiFetch<RsData<PaymentCancelResponse>>('/api/v1/payment/cancel', {
        method: 'POST',
        body: JSON.stringify({ orderId, cancelAmount, cancelReason }),
    });
    return json.data;
}

/** 빌링키 발급 */
export async function issueBillingKey(opts: {
    orderId: string;
    authKey: string;
    customerKey: string;
}): Promise<string> {
    const { orderId, authKey, customerKey } = opts;
    const json = await apiFetch<RsData<string>>('/api/v1/payment/billing/issue', {
        method: 'POST',
        body: JSON.stringify({ orderId, authKey, customerKey }),
    });
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
        orderId,
        amount,
        billingKey,
        customerKey,
        orderName,
        customerEmail,
        customerName,
        taxFreeAmount,
        taxExemptionAmount,
        idempotencyKey,
    } = opts;

    const idem = idempotencyKey ?? (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

    const json = await apiFetch<RsData<PaymentConfirmResponse>>('/api/v1/payment/billing/charge', {
        method: 'POST',
        headers: { 'Idempotency-Key': idem },
        body: JSON.stringify({
            billingKey,
            customerKey,
            amount,
            orderId,
            orderName,
            customerEmail,
            customerName,
            taxFreeAmount: taxFreeAmount ?? 0,
            taxExemptionAmount: taxExemptionAmount ?? 0,
        }),
    });
    return json.data;
}