'use client';

import { notificationFetch } from '@/lib/notification-api';
import type { RsData } from '@/types/notification';

export type QnaStatus = 'ACTIVE' | 'COMPLETED' | 'DELETED';
export type QnaType = 'QUESTION' | 'ANSWER';

export interface QnaPost {
    id: number;
    type: QnaType;
    parentId: number | null;
    memberId: number;
    content: string;
    status: QnaStatus;
    createdAt: string;
    updatedAt: string | null;
}

export interface QnaPage {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    content: QnaPost[];
}

export interface QnaThreadNode extends QnaPost { children: QnaThreadNode[] }
export interface QnaThreadResponse { root: QnaThreadNode }

// --- list
export async function getMyRoots(memberId: number, page=0, size=20) {
    const rs = await notificationFetch<QnaPage>(
        `/api/v1/notification/qna/me/questions?page=${page}&size=${size}`,
        { method: 'GET' }
    );
    return rs.data;
}
export async function getAdminRoots(memberId: number, page=0, size=20) {
    const rs = await notificationFetch<QnaPage>(
        `/api/v1/notification/qna/questions?page=${page}&size=${size}`,
        { method: 'GET' }
    );
    return rs.data;
}

// --- thread
export async function getMyThread(memberId: number, qid: number) {
    const rs = await notificationFetch<QnaThreadResponse>(
        `/api/v1/notification/qna/me/questions/${qid}/thread`,
        { method: 'GET' }
    );
    return rs.data;
}
export async function getAdminThread(memberId: number, qid: number) {
    const rs = await notificationFetch<QnaThreadResponse>(
        `/api/v1/notification/qna/questions/${qid}/thread`,
        { method: 'GET' }
    );
    return rs.data;
}

// --- commands
export async function createRootQuestion(memberId: number, content: string) {
    const rs = await notificationFetch<void>(
        `/api/v1/notification/qna/questions`,
        { method: 'POST', body: { content, parentId: null } }
    );
    return rs.data;
}
export async function createFollowUp(memberId: number, answerId: number, content: string) {
    const rs = await notificationFetch<void>(
        `/api/v1/notification/qna/questions`,
        { method: 'POST', body: { content, parentId: answerId } }
    );
    return rs.data;
}
export async function createAnswer(memberId: number, questionId: number, content: string) {
    const rs = await notificationFetch<void>(
        `/api/v1/notification/qna/questions/${questionId}/answers`,
        { method: 'POST', body: { content } }
    );
    return rs.data;
}