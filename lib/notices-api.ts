// lib/notices-api.ts
import { notificationFetch } from '@/lib/notification-api';
import type { Notice, PageResp, RsData } from '@/types/notice';

export async function getNoticesPage(
    memberId: number | string, page = 0, size = 10
): Promise<PageResp<Notice>> {
    const rs = await notificationFetch<RsData<PageResp<Notice>>>(
        `/api/v1/notification/notices?page=${page}&size=${size}`, { method: 'GET', memberId }
    );
    return rs.data;
}

export async function getNotice(
    memberId: number | string, id: number
): Promise<Notice> {
    const rs = await notificationFetch<RsData<Notice>>(
        `/api/v1/notification/${id}`, { method: 'GET', memberId }
    );
    return rs.data;
}

export async function setPinned(memberId: number | string, noticeId: number, pinned: boolean) {
    const rs = await notificationFetch<RsData<Notice>>(
        `/api/v1/notification/${noticeId}/pinned`, { method: 'PATCH', body: { pinned }, memberId }
    );
    return rs.data;
}
export async function deleteNotice(memberId: number | string, noticeId: number) {
    const rs = await notificationFetch<RsData<void>>(
        `/api/v1/notification/${noticeId}`, { method: 'DELETE', memberId }
    );
    return rs.data;
}
export async function createNotice(memberId: number | string, p:{title:string; content:string; pinned:boolean}) {
    const rs = await notificationFetch<RsData<Notice>>(`/api/v1/notification/notices`, { method: 'POST', body: p, memberId });
    return rs.data;
}
export async function editNotice(memberId: number | string, id:number, p:{title:string; content:string}) {
    const rs = await notificationFetch<RsData<Notice>>(`/api/v1/notification/notices/${id}`, { method: 'PUT', body: p, memberId });
    return rs.data;
}