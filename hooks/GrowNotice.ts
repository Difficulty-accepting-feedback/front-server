'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { Notice, PageResp } from '@/types/notice';
import { getNoticesPage, getNotice, setPinned, deleteNotice, createNotice, editNotice } from '@/lib/notices-api';

export function useGrowPinnedNotices(limit = 10): UseQueryResult<Notice[], Error> {
    return useQuery<Notice[], Error, Notice[], (string | number)[]>({
        queryKey: ['grow-notices','pinned', limit],
        queryFn: async () => {
            const page = await getNoticesPage(2, 0, Math.max(limit, 10));
            return (page.content ?? []).filter((n: Notice) => n.pinned);
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useGrowNoticePage(page: number, size: number): UseQueryResult<PageResp<Notice>, Error> {
    return useQuery<PageResp<Notice>, Error, PageResp<Notice>, (string | number)[]>({
        queryKey: ['grow-notices','page', page, size],
        queryFn: () => getNoticesPage(2, page, size),
        staleTime: 60 * 1000,
    });
}

export function useGrowNoticeDetail(id: number | undefined): UseQueryResult<Notice, Error> {
    return useQuery<Notice, Error, Notice, (string | number)[]>({
        queryKey: ['grow-notices','detail', id ?? 'empty'],
        enabled: typeof id === 'number' && id > 0,
        queryFn: () => getNotice(2, id!),
        staleTime: 60 * 1000,
    });
}

export function useGrowNoticeAdminActions() {
    const { me } = useAuth(); const memberId = me?.memberId ?? 2;
    const qc = useQueryClient();

    const pinMut = useMutation({
        mutationFn: (p:{id:number; pinned:boolean}) => setPinned(memberId, p.id, p.pinned),
        onSuccess: () => qc.invalidateQueries({ predicate: q => String(q.queryKey[0])==='grow-notices' }),
    });
    const delMut = useMutation({
        mutationFn: (id:number) => deleteNotice(memberId, id),
        onSuccess: () => qc.invalidateQueries({ predicate: q => String(q.queryKey[0])==='grow-notices' }),
    });
    const createMut = useMutation({
        mutationFn: (p:{title:string; content:string; pinned:boolean}) => createNotice(memberId, p),
        onSuccess: () => qc.invalidateQueries({ predicate: q => String(q.queryKey[0])==='grow-notices' }),
    });
    const editMut = useMutation({
        mutationFn: (p:{id:number; title:string; content:string}) => editNotice(memberId, p.id, { title:p.title, content:p.content }),
        onSuccess: () => qc.invalidateQueries({ predicate: q => String(q.queryKey[0])==='grow-notices' }),
    });

    return { pinMut, delMut, createMut, editMut };
}