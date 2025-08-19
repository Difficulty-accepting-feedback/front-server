export type NotificationListItem = {
    id: number;
    title: string;      // 예: "[GROW]", "[댓글]"
    content: string;
    read: boolean;
    createdAt: string;  // ISO 문자열 (LocalDateTime)
};

export type PageRs<T> = {
    items: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

// 여기선 안전하게 로컬 선언도 제공합니다.
export type RsData<T> = {
    code: string;
    msg: string;
    data: T;
};