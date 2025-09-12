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
        enabled: !!groupId, // groupId가 있을 때만 쿼리 실행
        queryFn: async (): Promise<NoticeResponse[]> => {
            // groupId가 없으면 빈 배열 반환 (undefined 방지)
            if (!groupId) {
                return [];
            }

            try {
                const resp = await apiFetch<RsData<NoticeResponse[]>>(`/api/v1/notification/notice/${groupId}`);

                // API 응답이 성공적이지 않으면 에러 던지기
                if (!resp || !resp.data) {
                    console.warn('API 응답에 data가 없습니다:', resp);
                    return []; // 빈 배열 반환
                }

                // data가 배열이 아닌 경우 빈 배열 반환
                if (!Array.isArray(resp.data)) {
                    console.warn('응답 데이터가 배열이 아닙니다:', resp.data);
                    return [];
                }

                return resp.data; // 명시적으로 NoticeResponse[] 반환
            } catch (error) {
                console.error('공지사항 목록 조회 실패:', error);
                throw error; // 에러를 다시 던져서 React Query가 처리하도록
            }
        },
        // 추가 옵션들
        staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
        gcTime: 10 * 60 * 1000, // 10분간 캐시 유지 (구 cacheTime)
        retry: 3, // 실패 시 3번 재시도
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
    });
}

export function useCreateNotice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: NoticeSaveRequest): Promise<RsData<NoticeResponse>> => {
            try {
                const response = await apiFetch<RsData<NoticeResponse>, NoticeSaveRequest>(`/api/v1/notification/notice/save`, {
                    method: 'POST',
                    body,
                });

                if (!response) {
                    throw new Error('공지사항 생성 응답이 없습니다');
                }

                return response;
            } catch (error) {
                console.error('공지사항 생성 실패:', error);
                throw error;
            }
        },
        onSuccess: (_data, variables) => {
            // 해당 그룹의 공지사항 목록 캐시 무효화
            qc.invalidateQueries({ queryKey: ['notices', variables.groupId] });
        },
        onError: (error) => {
            console.error('공지사항 생성 중 오류 발생:', error);
        },
    });
}

export function useUpdateNotices(groupId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: NoticeUpdateRequest[]): Promise<RsData<NoticeResponse[]>> => {
            if (!Array.isArray(body) || body.length === 0) {
                throw new Error('업데이트할 공지사항 데이터가 없습니다');
            }

            try {
                const response = await apiFetch<RsData<NoticeResponse[]>, NoticeUpdateRequest[]>(
                    `/api/notice/update/${groupId}`,
                    { method: 'PUT', body }
                );

                if (!response) {
                    throw new Error('공지사항 업데이트 응답이 없습니다');
                }

                return response;
            } catch (error) {
                console.error('공지사항 업데이트 실패:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // 해당 그룹의 공지사항 목록 캐시 무효화
            qc.invalidateQueries({ queryKey: ['notices', groupId] });
        },
        onError: (error) => {
            console.error('공지사항 업데이트 중 오류 발생:', error);
        },
    });
}

export function useDeleteNotice(groupId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (noticeId: number): Promise<RsData<void>> => {
            if (!noticeId || noticeId <= 0) {
                throw new Error('유효하지 않은 공지사항 ID입니다');
            }

            try {
                const response = await apiFetch<RsData<void>>(`/api/v1/notification/notice/${noticeId}`, {
                    method: 'DELETE'
                });

                if (!response) {
                    throw new Error('공지사항 삭제 응답이 없습니다');
                }

                return response;
            } catch (error) {
                console.error('공지사항 삭제 실패:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // 해당 그룹의 공지사항 목록 캐시 무효화
            qc.invalidateQueries({ queryKey: ['notices', groupId] });
        },
        onError: (error) => {
            console.error('공지사항 삭제 중 오류 발생:', error);
        },
    });
}

// 유틸리티 함수: 특정 그룹의 공지사항 캐시 무효화
export function invalidateNoticesCache(groupId: number) {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ['notices', groupId] });
}

// 유틸리티 함수: 모든 공지사항 캐시 무효화
export function invalidateAllNoticesCache() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ['notices'] });
}