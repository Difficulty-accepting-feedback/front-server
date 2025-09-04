export type RsData<T> = {
    resultCode: string;
    msg: string;
    data: T;
};

export type NoticeResponse = {
    noticeId: number;
    content: string;
    isPinned: boolean;
};

export type NoticeSaveRequest = {
    groupId: number;
    content: string; // 10~500자
    isPinned: boolean;
};

export type NoticeUpdateRequest = {
    noticeId: number;
    content: string; // 10~500자
    isPinned: boolean;
};

export type Notice = {
    noticeId: number;
    title: string;
    content: string;
    pinned: boolean;
    createdAt: string;
};

export type PageResp<T> = {
    content: T[];
    pageable: any;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
};