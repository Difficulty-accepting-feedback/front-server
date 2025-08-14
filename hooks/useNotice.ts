import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type {
    NoticeResponse,
    NoticeSaveRequest,
    NoticeUpdateRequest,
    RsData,
} from '@/types/notice';

const qk = {
    list: (groupId: number) => ['notices', groupId] as const,
};

export function useNoticeList(groupId: number | null) {
    return useQuery({
        queryKey: groupId ? qk.list(groupId) : ['notices', 'disabled'],
        enabled: !!groupId,
        queryFn: async () => {
            const resp = await apiFetch<RsData<NoticeResponse[]>>(`/api/notice/${groupId}`);
            return resp.data;
        },
    });
}

export function useCreateNotice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: NoticeSaveRequest) => {
            return apiFetch<RsData<string>, NoticeSaveRequest>('/api/notice/save', {
                method: 'POST',
                body,
            });
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['notices', variables.groupId] });
        },
    });
}

export function useUpdateNotices(groupId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: NoticeUpdateRequest[]) => {
            return apiFetch<RsData<string>, NoticeUpdateRequest[]>(
                `/api/notice/update/${groupId}`,
                { method: 'PUT', body },
            );
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notices', groupId] });
        },
    });
}

export function useDeleteNotice(groupId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (noticeId: number) => {
            return apiFetch<RsData<string>>(`/api/notice/${noticeId}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notices', groupId] });
        },
    });
}