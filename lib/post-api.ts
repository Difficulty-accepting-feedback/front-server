export type RsData<T> = {
    code: string;
    message: string;
    data: T;
};

export type PostSimpleResponse = {
    postId: number;
    boardId: number;
    memberId: number;
    title: string;
    createdAt: string;
};