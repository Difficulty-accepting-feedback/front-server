'use client'

import { notificationFetch } from '@/lib/notification-api'
import type { RsData } from '@/types/notification'

export type QnaStatus = 'ACTIVE' | 'COMPLETED' | 'DELETED'
export type QnaType = 'QUESTION' | 'ANSWER'

export interface QnaPost {
    id: number
    type: QnaType
    parentId: number | null
    memberId: number
    content: string
    status: QnaStatus
    createdAt: string
    updatedAt: string | null
}

export interface QnaPage {
    page: number
    size: number
    totalElements: number
    totalPages: number
    content: QnaPost[]
}

export interface QnaThreadNode extends QnaPost {
    children: QnaThreadNode[]
}
export interface QnaThreadResponse { root: QnaThreadNode }

// --- list
export async function getMyRoots(memberId: number, page=0, size=20) {
    const rs = await notificationFetch<RsData<QnaPage>>(
        `/api/v1/notification/qna/me/questions?page=${page}&size=${size}`,
        { memberId }
    )
    return rs.data
}
export async function getAdminRoots(memberId: number, page=0, size=20) {
    const rs = await notificationFetch<RsData<QnaPage>>(
        `/api/v1/notification/qna/questions?page=${page}&size=${size}`,
        { memberId }
    )
    return rs.data
}

// --- thread
export async function getMyThread(memberId: number, qid: number) {
    const rs = await notificationFetch<RsData<QnaThreadResponse>>(
        `/api/v1/notification/qna/me/questions/${qid}/thread`,
        { memberId }
    )
    return rs.data
}
export async function getAdminThread(memberId: number, qid: number) {
    const rs = await notificationFetch<RsData<QnaThreadResponse>>(
        `/api/v1/notification/qna/questions/${qid}/thread`,
        { memberId }
    )
    return rs.data
}

// --- commands
export async function createRootQuestion(memberId: number, content: string) {
    return notificationFetch<RsData<void>>(
        `/api/v1/notification/qna/questions`,
        { method: 'POST', memberId, body: { content, parentId: null } }
    )
}

export async function createFollowUp(memberId: number, answerId: number, content: string) {
    return notificationFetch<RsData<void>>(
        `/api/v1/notification/qna/questions`,
        { method: 'POST', memberId, body: { content, parentId: answerId } }
    )
}

export async function createAnswer(memberId: number, questionId: number, content: string) {
    return notificationFetch<RsData<void>>(
        `/api/v1/notification/qna/questions/${questionId}/answers`,
        { method: 'POST', memberId, body: { content } }
    )
}