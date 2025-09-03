'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import {
    getAdminRoots, getMyRoots, getMyThread, getAdminThread,
    createRootQuestion, createFollowUp, createAnswer
} from '@/lib/qna-api'

/** 관리자인지 “백엔드로 확인”하는 가벼운 프로브(200이면 true, 403이면 false) */
export function useIsAdminProbe() {
    const { me } = useAuth(); const memberId = me?.memberId
    return useQuery({
        queryKey: ['qna','admin-probe', memberId],
        enabled: !!memberId,
        queryFn: async () => {
            try { await getAdminRoots(memberId!, 0, 1); return true }
            catch (e: any) { return false }
        }
    })
}

export function useQnaPreviewSmart() {
    const { me } = useAuth(); const memberId = me?.memberId
    const { data: isAdmin } = useIsAdminProbe()

    return useQuery({
        queryKey: ['qna','preview-smart', memberId, isAdmin],
        enabled: !!memberId && isAdmin !== undefined,
        queryFn: () => isAdmin ? getAdminRoots(memberId!, 0, 3) : getMyRoots(memberId!, 0, 3),
    })
}


// lists
export function useMyRootList(page:number, size:number) {
    const { me } = useAuth(); const memberId = me?.memberId
    return useQuery({
        queryKey: ['qna','me','roots', memberId, page, size],
        enabled: !!memberId,
        queryFn: () => getMyRoots(memberId!, page, size),
    })
}
export function useAdminRootList(page:number, size:number, enabled=true) {
    const { me } = useAuth(); const memberId = me?.memberId
    return useQuery({
        queryKey: ['qna','admin','roots', memberId, page, size],
        enabled: !!memberId && enabled,
        queryFn: () => getAdminRoots(memberId!, page, size),
    })
}

// threads
export function useMyThread(qid:number) {
    const { me } = useAuth(); const memberId = me?.memberId
    return useQuery({
        queryKey: ['qna','me','thread', memberId, qid],
        enabled: !!memberId && !!qid,
        queryFn: () => getMyThread(memberId!, qid),
    })
}
export function useAdminThread(qid:number, enabled=true) {
    const { me } = useAuth(); const memberId = me?.memberId
    return useQuery({
        queryKey: ['qna','admin','thread', memberId, qid],
        enabled: !!memberId && !!qid && enabled,
        queryFn: () => getAdminThread(memberId!, qid),
    })
}

// commands
export function useCreateRootQuestion() {
    const qc = useQueryClient(); const { me } = useAuth(); const memberId = me?.memberId
    return useMutation({
        mutationFn: (content:string) => createRootQuestion(memberId!, content),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['qna','me','roots'] }),
    })
}
export function useCreateFollowUp() {
    const qc = useQueryClient(); const { me } = useAuth(); const memberId = me?.memberId
    return useMutation({
        mutationFn: (p:{answerId:number; content:string}) => createFollowUp(memberId!, p.answerId, p.content),
        onSuccess: () => qc.invalidateQueries({ predicate: q => String(q.queryKey[0])==='qna' }),
    })
}
export function useCreateAnswer() {
    const qc = useQueryClient(); const { me } = useAuth(); const memberId = me?.memberId
    return useMutation({
        mutationFn: (p:{questionId:number; content:string}) => createAnswer(memberId!, p.questionId, p.content),
        onSuccess: () => qc.invalidateQueries({ predicate: q => String(q.queryKey[0])==='qna' }),
    })
}