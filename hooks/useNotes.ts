'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NOTIFICATION_BASE_URL } from '@/lib/env'

function buildHeaders(memberId: number): HeadersInit {
    return { 'Content-Type': 'application/json', 'X-Authorization-Id': String(memberId) }
}

async function getJSON<T>(path: string, memberId: number): Promise<T> {
    const res = await fetch(`${NOTIFICATION_BASE_URL}${path}`, { method: 'GET', credentials: 'include', headers: buildHeaders(memberId) })
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
    const body = await res.json().catch(() => null)
    return (body?.data ?? body) as T
}

async function postVoid(path: string, memberId: number) {
    const res = await fetch(`${NOTIFICATION_BASE_URL}${path}`, { method: 'POST', credentials: 'include', headers: buildHeaders(memberId) })
    if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`)
}

async function delVoid(path: string, memberId: number) {
    const res = await fetch(`${NOTIFICATION_BASE_URL}${path}`, { method: 'DELETE', credentials: 'include', headers: buildHeaders(memberId) })
    if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`)
}

/* ---------- 타입: 닉네임 포함 ---------- */
export type NoteItem = {
    noteId: number
    senderId: number
    recipientId: number
    senderNickname: string
    recipientNickname: string
    content: string
    createdAt: string
    isRead: boolean
}

export type NotePageResponse = {
    page: number
    size: number
    totalElements: number
    totalPages: number
    content: NoteItem[]
}

/* ---------- 전송 DTO: recipientNickname 으로 전송 ---------- */
type SendNoteRequest = {
    recipientNickname: string
    content: string
}

export function useNoteUnreadCount(memberId?: number) {
    return useQuery({
        queryKey: ['notes', 'unread-count', memberId],
        queryFn: () => getJSON<number>('/api/notes/unread-count', memberId as number),
        enabled: !!memberId,
        staleTime: 10_000,
    })
}

export function useNoteInbox(memberId?: number, page = 0, size = 3) {
    const qc = useQueryClient()
    return useQuery({
        queryKey: ['notes', 'inbox', memberId, page, size],
        queryFn: () => getJSON<NotePageResponse>(`/api/notes/inbox?page=${page}&size=${size}`, memberId as number),
        enabled: !!memberId,
        placeholderData: () => {
            if (!memberId || page <= 0) return undefined
            return qc.getQueryData<NotePageResponse>(['notes', 'inbox', memberId, page - 1, size]) ?? undefined
        },
    })
}

export function useNoteOutbox(memberId?: number, page = 0, size = 3) {
    const qc = useQueryClient()
    return useQuery({
        queryKey: ['notes', 'outbox', memberId, page, size],
        queryFn: () => getJSON<NotePageResponse>(`/api/notes/outbox?page=${page}&size=${size}`, memberId as number),
        enabled: !!memberId,
        placeholderData: () => {
            if (!memberId || page <= 0) return undefined
            return qc.getQueryData<NotePageResponse>(['notes', 'outbox', memberId, page - 1, size]) ?? undefined
        },
    })
}

export function useMarkNoteRead(memberId?: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (noteId: number) => postVoid(`/api/notes/${noteId}/read`, memberId as number),
        onSuccess: () => {
            qc.invalidateQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'notes' && q.queryKey.includes(memberId as number),
            })
            qc.invalidateQueries({ queryKey: ['notes', 'unread-count', memberId] })
        },
    })
}

export function useDeleteNote(memberId?: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (noteId: number) => delVoid(`/api/notes/${noteId}`, memberId as number),
        onSuccess: () => {
            qc.invalidateQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'notes' && q.queryKey.includes(memberId as number),
            })
            qc.invalidateQueries({ queryKey: ['notes', 'unread-count', memberId] })
        },
    })
}

async function postJSON<T>(path: string, memberId: number, body: unknown): Promise<T> {
    const res = await fetch(`${NOTIFICATION_BASE_URL}${path}`, { method: 'POST', credentials: 'include', headers: buildHeaders(memberId), body: JSON.stringify(body) })
    const text = await res.text()
    const json = text ? JSON.parse(text) : null
    if (!res.ok) throw new Error(json?.message ?? `HTTP ${res.status}`)
    return (json?.data ?? json) as T
}

export function useSendNote(memberId?: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: SendNoteRequest) => postJSON<unknown>('/api/notes', memberId as number, dto),
        onSuccess: () => {
            qc.invalidateQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'notes' && q.queryKey.includes(memberId as number),
            })
            qc.invalidateQueries({ queryKey: ['notes', 'unread-count', memberId] })
        },
    })
}