'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        toast.error('구독 결제 인증에 실패했습니다.');
        router.replace('/me/payments');
    }, [router]);

    return <div className="p-6 text-sm text-muted-foreground">이동 중…</div>;
}