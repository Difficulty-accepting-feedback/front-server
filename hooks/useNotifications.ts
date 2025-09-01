'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationFetch } from '@/lib/notification-api';
import type { NotificationListItem, PageRs, RsData } from '@/types/notification';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { NOTIFICATION_BASE_URL } from '@/lib/env';

declare global {
    interface Window {
        /** 전역 싱글톤 SSE 상태 */
        __GROW_SSE__?: {
            active: boolean;
            memberId?: number;
            connecting: boolean;
            controller?: AbortController;
            lastRecv: number;
            heartbeatTimer: number | null;
            reconnectTimer: number | null;
            backoff: number;
            /** 연결 세대 식별자(레이스 방지) */
            gen: number;
        };
    }
}

const qk = {
    list: (memberId: number | null | undefined, page: number, size: number) =>
        ['notifications', 'list', memberId ?? 'guest', page, size] as const,
    unread: (memberId: number | null | undefined) =>
        ['notifications', 'unread', memberId ?? 'guest'] as const,
};

/* ---------- 리스트/카운트/변경 ---------- */
export function useNotificationList(page: number, size: number) {
    const { me } = useAuth();
    const memberId = me?.memberId;

    return useQuery({
        queryKey: qk.list(memberId, page, size),
        enabled: !!memberId,
        queryFn: async () => {
            const rs = await notificationFetch<RsData<PageRs<NotificationListItem>>>(
                `/api/v1/notifications?page=${page}&size=${size}`,
                { memberId },
            );
            return rs.data;
        },
    });
}

export function useUnreadCount() {
    const { me } = useAuth();
    const memberId = me?.memberId;

    return useQuery({
        queryKey: qk.unread(memberId),
        enabled: !!memberId,
        queryFn: async () => {
            const rs = await notificationFetch<RsData<{ count: number }>>(
                `/api/v1/notifications/unread-count`,
                { memberId },
            );
            return rs.data.count;
        },
        refetchInterval: 0, // SSE가 invalidation 하므로 폴링 X
    });
}

export function useMarkAllRead() {
    const qc = useQueryClient();
    const { me } = useAuth();
    const memberId = me?.memberId;

    return useMutation({
        mutationFn: async () => {
            const rs = await notificationFetch<RsData<number>>(
                `/api/v1/notifications/read-all`,
                { method: 'POST', memberId },
            );
            return rs.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.unread(memberId) });
            qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
            toast.success('모든 알림을 읽음 처리했습니다.');
        },
    });
}

export function useMarkOneRead() {
    const qc = useQueryClient();
    const { me } = useAuth();
    const memberId = me?.memberId;

    return useMutation({
        mutationFn: async (id: number) => {
            await notificationFetch<RsData<void>>(
                `/api/v1/notifications/${id}/read`,
                { method: 'POST', memberId },
            );
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.unread(memberId) });
            qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
        },
    });
}

export function useDeleteNotification() {
    const qc = useQueryClient();
    const { me } = useAuth();
    const memberId = me?.memberId;

    return useMutation({
        mutationFn: async (id: number) => {
            await notificationFetch<RsData<void>>(
                `/api/v1/notifications/${id}`,
                { method: 'DELETE', memberId },
            );
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
            qc.invalidateQueries({ queryKey: qk.unread(memberId) });
            toast.success('알림을 삭제했습니다.');
        },
    });
}

export function useDeleteOlderThan() {
    const qc = useQueryClient();
    const { me } = useAuth();
    const memberId = me?.memberId;

    return useMutation({
        mutationFn: async (beforeIso: string) => {
            await notificationFetch<RsData<number>>(
                `/api/v1/notifications/older-than?before=${encodeURIComponent(beforeIso)}`,
                { method: 'DELETE', memberId },
            );
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
            qc.invalidateQueries({ queryKey: qk.unread(memberId) });
            toast.success('오래된 알림을 정리했습니다.');
        },
    });
}

/* ---------- SSE 구독 (전역 싱글톤 + gen 가드 고도화) ---------- */
type SseOptions = {
    onEvent?: (evt: { event?: string; data?: string }) => void;
    onOpen?: () => void;
    onError?: (e: unknown) => void;
    memberIdOverride?: number;
    bootstrapToastCount?: number;
    realtimeToast?: boolean;
};

const SSE_HEARTBEAT_MS = 45_000;
const SSE_BACKOFF_INITIAL = 1_000;
const SSE_BACKOFF_MULTIPLIER = 1.6;
const SSE_BACKOFF_MAX = 30_000;

export function useNotificationSse(opts?: SseOptions) {
    const { me } = useAuth();
    const qc = useQueryClient();

    const bootstrapRanRef = useRef(false);

    const memberId = opts?.memberIdOverride ?? me?.memberId;
    const bootstrapN = opts?.bootstrapToastCount ?? 3;
    const realtimeToast = opts?.realtimeToast ?? true;

    useEffect(() => {
        if (!memberId) return;
        if (typeof window === 'undefined') return;

        // 전역 상태 초기화
        const g = (window.__GROW_SSE__ ??= {
            active: false,
            memberId: undefined as number | undefined,
            connecting: false,
            controller: undefined as AbortController | undefined,
            lastRecv: 0,
            heartbeatTimer: null as number | null,
            reconnectTimer: null as number | null,
            backoff: SSE_BACKOFF_INITIAL,
            gen: 0,
        });

        // 이미 동일 사용자로 활성화되어 있으면 아무 것도 하지 않음
        if (g.active && g.memberId === memberId) {
            return;
        }

        // 사용자 변경 → 기존 연결 완전 정리 + gen 증가
        if (g.active && g.memberId !== memberId) {
            try { g.controller?.abort(); } catch {}
            if (g.heartbeatTimer) { window.clearInterval(g.heartbeatTimer); g.heartbeatTimer = null; }
            if (g.reconnectTimer) { window.clearTimeout(g.reconnectTimer); g.reconnectTimer = null; }
            g.active = false;
            g.connecting = false;
            g.controller = undefined;
            g.lastRecv = 0;
            g.backoff = SSE_BACKOFF_INITIAL;
            g.gen++; // ✅ 세대 올려서 과거 타이머/루프 무효화
        }

        const clearHeartbeat = () => {
            if (g.heartbeatTimer) {
                window.clearInterval(g.heartbeatTimer);
                g.heartbeatTimer = null;
            }
        };

        // ✅ gen 을 파라미터로 받아 “그 연결의 세대”에서만 동작
        const scheduleReconnect = (reason: string, genAtCaller: number) => {
            // 호출 당시 gen과 현재 gen이 다르면 폐기
            if (!g.active || g.gen !== genAtCaller) return;

            // 남아있는 스트림/리더 즉시 정리
            try { g.controller?.abort(); } catch {}
            g.connecting = false;

            const base = Math.min(g.backoff, SSE_BACKOFF_MAX);
            const jitter = base * (0.2 * (Math.random() - 0.5) * 2);
            const delay = Math.max(500, Math.floor(base + jitter));
            g.backoff = Math.min(Math.floor(g.backoff * SSE_BACKOFF_MULTIPLIER), SSE_BACKOFF_MAX);

            if (g.reconnectTimer) window.clearTimeout(g.reconnectTimer);

            // 타이머도 gen을 캡처해서, 그 gen에서만 재시도
            g.reconnectTimer = window.setTimeout(() => {
                g.reconnectTimer = null;
                if (!g.active || g.gen !== genAtCaller) return;
                connect(); // 같은 gen에서만 진입
            }, delay);

            // eslint-disable-next-line no-console
            console.warn(`[SSE] reconnect in ${delay}ms (reason=${reason}, gen=${genAtCaller})`);
        };

        const startHeartbeatWatchdog = (genAtStart: number) => {
            g.lastRecv = Date.now();
            clearHeartbeat();
            g.heartbeatTimer = window.setInterval(() => {
                const idle = Date.now() - g.lastRecv;
                if (idle > SSE_HEARTBEAT_MS) {
                    // eslint-disable-next-line no-console
                    console.warn('[SSE] heartbeat timeout, restart');
                    try { g.controller?.abort(); } catch {}
                    scheduleReconnect('heartbeat-timeout', genAtStart);
                }
            }, Math.floor(SSE_HEARTBEAT_MS / 2));
        };

        const fetchTopUnreadAndToast = async () => {
            if (bootstrapRanRef.current) return;
            bootstrapRanRef.current = true;
            try {
                const rs = await notificationFetch<RsData<NotificationListItem[]>>(
                    `/api/v1/notifications/top?size=${bootstrapN}`,
                    { memberId },
                );
                (rs?.data ?? []).forEach((n) => {
                    toast(`${n.title} ${n.content}`, { duration: 3000 });
                });
            } catch {
                /* noop */
            }
        };

        const connect = async () => {
            if (g.connecting) return;
            g.connecting = true;

            // ✅ 새 연결 시작: gen 증가 & 캡처
            const myGen = ++g.gen;

            // 이전 컨트롤러 정리
            try { g.controller?.abort(); } catch {}
            const controller = new AbortController();
            g.controller = controller;

            g.memberId = memberId;
            g.active = true;

            try {
                const res = await fetch(`${NOTIFICATION_BASE_URL}/api/v1/notification/subscribe`, {
                    method: 'GET',
                    headers: {
                        Accept: 'text/event-stream',
                        'X-Authorization-Id': String(memberId),
                    },
                    credentials: 'include',
                    signal: controller.signal,
                    cache: 'no-store',
                });

                if (!res.ok || !res.body) throw new Error(`SSE HTTP ${res.status}`);

                // 연결 성공
                g.backoff = SSE_BACKOFF_INITIAL;
                startHeartbeatWatchdog(myGen);
                opts?.onOpen?.();

                fetchTopUnreadAndToast();

                // eslint-disable-next-line no-console
                console.info('[SSE] open, memberId=', memberId, 'gen=', myGen);

                const reader = res.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                g.connecting = false;

                while (g.active && g.gen === myGen) {
                    const { value, done } = await reader.read();
                    if (done) {
                        // ✅ 반드시 “나를 연 연결 gen”으로 예약
                        scheduleReconnect('eof', myGen);
                        break;
                    }
                    g.lastRecv = Date.now();
                    buffer += decoder.decode(value, { stream: true });

                    let sepIdx: number;
                    while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
                        const chunk = buffer.slice(0, sepIdx);
                        buffer = buffer.slice(sepIdx + 2);

                        let eventName: string | undefined;
                        let data: string | undefined;

                        chunk.split('\n').forEach((line) => {
                            if (line.startsWith('event:')) eventName = line.slice(6).trim();
                            else if (line.startsWith('data:')) {
                                const d = line.slice(5).trim();
                                data = (data ?? '') + d;
                            }
                        });

                        if (eventName === 'ping') continue;

                        opts?.onEvent?.({ event: eventName, data });

                        if (eventName && eventName !== '[connect]') {
                            qc.invalidateQueries({ queryKey: ['notifications', 'unread', memberId] });
                            qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
                            if (data && realtimeToast) {
                                toast(`${eventName} ${data}`, { duration: 3000 });
                            }
                        }
                    }
                }
            } catch (e) {
                g.connecting = false;
                opts?.onError?.(e);
                // ✅ 실패도 “나의 gen”으로만 재시도
                scheduleReconnect('fetch-error', myGen);
            }
        };

        // 가시성 복귀 시 오래 idle이면 같은 gen에서만 재시작
        const onVis = () => {
            if (document.visibilityState === 'visible') {
                const last = window.__GROW_SSE__?.lastRecv ?? 0;
                if (Date.now() - last > SSE_HEARTBEAT_MS) {
                    try { window.__GROW_SSE__?.controller?.abort(); } catch {}
                    connect();
                }
            }
        };
        document.addEventListener('visibilitychange', onVis);

        const onUnload = () => {
            const g = window.__GROW_SSE__;
            if (!g) return;
            g.active = false;
            g.connecting = false;
            try { g.controller?.abort(); } catch {}
            if (g.heartbeatTimer) window.clearInterval(g.heartbeatTimer);
            if (g.reconnectTimer) window.clearTimeout(g.reconnectTimer);
            window.__GROW_SSE__ = undefined;
        };
        window.addEventListener('beforeunload', onUnload);

        connect();

        return () => {
            document.removeEventListener('visibilitychange', onVis);
            window.removeEventListener('beforeunload', onUnload);
            // 전역 연결은 유지
        };
    }, [memberId]);
}