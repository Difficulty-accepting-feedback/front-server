import { MEMBER_BASE_URL } from '@/lib/env';

type RsData<T> = { code: string; message: string; data: T };

export async function resolveMemberIdByNickname(nickname: string): Promise<number> {
    const url = `${MEMBER_BASE_URL}/api/members/resolve?nickname=${encodeURIComponent(
        nickname.trim(),
    )}`;
    const res = await fetch(url, { credentials: 'include' });
    const body = (await res.json().catch(() => ({}))) as Partial<RsData<{ memberId: number }>>;

    if (!res.ok) {
        const msg = (body as any)?.message ?? `닉네임 해석 실패 (HTTP ${res.status})`;
        throw new Error(msg);
    }
    const memberId = body?.data?.memberId;
    if (!memberId) throw new Error('해당 닉네임을 찾을 수 없습니다.');
    return Number(memberId);
}