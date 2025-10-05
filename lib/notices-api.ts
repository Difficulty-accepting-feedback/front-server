import { notificationFetch, type RsData } from '@/lib/notification-api';
import type { Notice, PageResp } from '@/types/notice';

export async function getNoticesPage(
    memberId: number | string, page = 0, size = 10
): Promise<PageResp<Notice>> {
    const rs = await notificationFetch<PageResp<Notice>>(
        `/api/v1/notification/notices?page=${page}&size=${size}`,
        { method: 'GET' }
    );
    return rs.data;
}

export async function getNotice(
    memberId: number | string, id: number
): Promise<Notice> {
    const rs = await notificationFetch<Notice>(
        `/api/v1/notification/${id}`, { method: 'GET' }
    );
    return rs.data;
}

export async function setPinned(memberId: number | string, noticeId: number, pinned: boolean) {
    const rs = await notificationFetch<Notice>(
        `/api/v1/notification/${noticeId}/pinned`,
        { method: 'PATCH', body: { pinned } }
    );
    return rs.data;
}

export async function deleteNotice(memberId: number | string, noticeId: number) {
    const rs = await notificationFetch<void>(
        `/api/v1/notification/${noticeId}`, { method: 'DELETE' }
    );
    return rs.data;
}

export async function createNotice(memberId: number | string, p:{title:string; content:string; pinned:boolean}) {
    const rs = await notificationFetch<Notice>(
        `/api/v1/notification/notices`, { method: 'POST', body: p }
    );
    return rs.data;
}

export async function editNotice(memberId: number | string, id:number, p:{title:string; content:string}) {
    const rs = await notificationFetch<Notice>(
        `/api/v1/notification/notices/${id}`, { method: 'PUT', body: p }
    );
    return rs.data;
}