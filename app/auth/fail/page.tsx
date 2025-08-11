'use client'

export default function AuthFail({
                                     searchParams,
                                 }: {
    searchParams: { error?: string; message?: string }
}) {
    const msg =
        searchParams.message ??
        searchParams.error ??
        '로그인에 실패했습니다. 다시 시도해 주세요.'

    return (
        <main className="mx-auto max-w-lg p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold">로그인 실패 😢</h1>
            <p className="text-muted-foreground whitespace-pre-wrap">{msg}</p>
            <a className="mt-6 inline-block underline" href="/login">
                로그인 페이지로 돌아가기
            </a>
        </main>
    )
}