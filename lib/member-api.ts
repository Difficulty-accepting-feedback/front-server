import { MEMBER_BASE_URL } from '@/lib/env';
import { apiFetch } from '@/lib/api-fetch';

type Rs = { memberId: number };

export async function resolveMemberIdByNickname(nickname: string): Promise<number> {
    const data = await apiFetch<Rs>(
        MEMBER_BASE_URL,
        `/api/v1/members/resolve?nickname=${encodeURIComponent(nickname.trim())}`,
        { method: 'GET' }
    );
    if (!data?.memberId) throw new Error('해당 닉네임을 찾을 수 없습니다.');
    return Number(data.memberId);
}