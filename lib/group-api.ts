export enum Category {
    STUDY = 'STUDY',
    HOBBY = 'HOBBY',
    MENTORING = 'MENTORING',
}

export interface GroupResponse {
    groupId: number;
    groupName: string;
    category: Category;
    description: string;
}

interface RsData<T> {
    code: string;
    message: string;
    data: T;
}

const BASE_URL = 'http://localhost:8085';

export async function getGroups(category: Category): Promise<GroupResponse[]> {
    const res = await fetch(`${BASE_URL}/api/v1/groups/${category}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 필요 시 인증 헤더 추가: 'X-Authorization-Id': '1',
        },
        cache: 'force-cache', // 캐싱 활성화로 반복 호출 방지
    });

    if (!res.ok) {
        throw new Error('그룹 목록을 불러오는 데 실패했습니다.');
    }

    const rsData: RsData<GroupResponse[]> = await res.json();
    if (rsData.code !== '200') {
        throw new Error(rsData.message || 'API 응답 오류');
    }

    return rsData.data || [];
}
