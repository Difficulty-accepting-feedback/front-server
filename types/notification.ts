export type NotificationListItem = {
    id: number;
    title: string;
    content: string;
    read: boolean;
    createdAt: string;
};

export type PageRs<T> = {
    items: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

export type RsData<T> = {
    code: string;
    msg: string;
    data: T;
};