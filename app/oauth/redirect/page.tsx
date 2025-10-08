import { Suspense } from 'react';
import OAuthRedirectClient from './OAuthRedirectClient';

export const dynamic = 'force-dynamic'; // 쿼리 의존 → SSG 방지

export default function Page() {
    return (
        <Suspense fallback={<div>로그인 처리 중…</div>}>
            <OAuthRedirectClient />
        </Suspense>
    );
}