'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const NOTE_BASE = process.env.NEXT_PUBLIC_NOTE_BASE ?? 'http://localhost:8084'

function buildHeaders(memberId: number): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'X-Authorization-Id': String(memberId),
    }
}

async function getJSON<T>(path: string, memberId: number): Promise<T> {
    if (memberId === undefined || memberId === null) {
        throw new Error('memberId is required')
    }

    const res = await fetch(`${NOTE_BASE}${path}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(memberId),
    })
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
    const body = await res.json().catch(() => null)
    return (body?.data ?? body) as T
}

async function postVoid(path: string, memberId: number) {
    if (memberId === undefined || memberId === null) {
        throw new Error('memberId is required')
    }

    const res = await fetch(`${NOTE_BASE}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(memberId),
    })
    if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`)
}

async function delVoid(path: string, memberId: number) {
    if (memberId === undefined || memberId === null) {
        throw new Error('memberId is required')
    }

    const res = await fetch(`${NOTE_BASE}${path}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(memberId),
    })
    if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`)
}

export type NoteItem = {
    noteId: number
    senderId: number
    recipientId: number
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

type SendNoteRequest = {
    recipientId: number
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
            if (!memberId) return undefined
            if (page <= 0) return undefined
            const prev = qc.getQueryData<NotePageResponse>(['notes', 'inbox', memberId, page - 1, size])
            return prev ?? undefined
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
            if (!memberId) return undefined
            if (page <= 0) return undefined
            const prev = qc.getQueryData<NotePageResponse>(['notes', 'outbox', memberId, page - 1, size])
            return prev ?? undefined
        },
    })
}

export function useMarkNoteRead(memberId?: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (noteId: number) => postVoid(`/api/notes/${noteId}/read`, memberId as number),
        onSuccess: () => {
            // memberId에 해당하는 notes 관련 캐시만 무효화
            qc.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey
                    return Array.isArray(key) && key[0] === 'notes' && key.includes(memberId as number)
                },
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
                predicate: (query) => {
                    const key = query.queryKey
                    return Array.isArray(key) && key[0] === 'notes' && key.includes(memberId as number)
                },
            })
            qc.invalidateQueries({ queryKey: ['notes', 'unread-count', memberId] })
        },
    })
}

async function postJSON<T>(path: string, memberId: number, body: unknown): Promise<T> {
    if (memberId === undefined || memberId === null) {
        throw new Error('memberId is required')
    }

    const res = await fetch(`${NOTE_BASE}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(memberId),
        body: JSON.stringify(body),
    })
    const text = await res.text()
    const json = text ? JSON.parse(text) : null
    if (!res.ok) {
        const msg = json?.message ?? `HTTP ${res.status}`
        throw new Error(msg)
    }
    return (json?.data ?? json) as T
}

export function useSendNote(memberId?: number) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (dto: SendNoteRequest) => postJSON<unknown>('/api/notes', memberId as number, dto),
        onSuccess: () => {
            qc.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey
                    return Array.isArray(key) && key[0] === 'notes' && key.includes(memberId as number)
                },
            })
        },
    })
}