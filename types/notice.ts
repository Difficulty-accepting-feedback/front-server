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
