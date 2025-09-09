'use client'

import { useState, KeyboardEvent } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useMyRootList, useCreateRootQuestion } from '@/hooks/useQna'
import { Plus, X, Send } from 'lucide-react'

export default function MyQnaListPage() {
    const [page, setPage] = useState(0)
    const size = 20
    const { data, isLoading, isError } = useMyRootList(page, size)

    const [isWriting, setIsWriting] = useState(false)
    const [content, setContent] = useState('')

    const {
        mutate: createRootQuestion,
        isPending: creating,
        error: createError,
    } = useCreateRootQuestion()

    const canSubmit = content.trim().length > 0 && !creating

    const handleSubmit = () => {
        if (!canSubmit) return
        createRootQuestion(content.trim(), {
            onSuccess: () => {
                setContent('')
                setIsWriting(false)
                setPage(0)
            },
        })
    }

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            setIsWriting(false)
            setContent('')
        }
    }

    return (
        <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg">내 1:1 문의</CardTitle>
                {!isWriting ? (
                    <Button size="sm" onClick={() => setIsWriting(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        문의 작성
                    </Button>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => { setIsWriting(false); setContent('') }}>
                        <X className="mr-1 h-4 w-4" />
                        작성 취소
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {isWriting && (
                    <div className="mb-6 rounded-md border border-emerald-100/60 p-3 bg-emerald-50/40 dark:bg-emerald-900/10">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="문의 내용을 입력하세요."
                            className="min-h-[120px]"
                            disabled={creating}
                        />
                        <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.trim().length}/1000
              </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setIsWriting(false); setContent('') }}
                                    disabled={creating}
                                >
                                    취소
                                </Button>
                                <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
                                    <Send className="mr-1 h-4 w-4" />
                                    등록
                                </Button>
                            </div>
                        </div>
                        {createError && (
                            <p className="mt-2 text-xs text-red-500">등록에 실패했습니다. 잠시 후 다시 시도해 주세요.</p>
                        )}
                    </div>
                )}

                {isLoading && <Skeleton className="h-24 w-full" />}
                {isError && <div className="text-sm text-red-500">불러오기에 실패했습니다.</div>}
                {!isLoading && !isError && data?.content.length === 0 && !isWriting && (
                    <p className="text-sm text-muted-foreground">문의가 없습니다. 상단의 ‘글 작성’으로 새 문의를 남겨주세요.</p>
                )}

                {data && data.content.length > 0 && (
                    <>
                        <ul className="divide-y divide-emerald-100/60">
                            {data.content.map((q) => (
                                <li key={q.id} className="py-3">
                                    <div className="flex items-center gap-2">
                    <span
                        className={`text-xs px-2 py-0.5 rounded ${
                            q.status === 'COMPLETED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-white'
                        }`}
                    >
                      {q.status === 'COMPLETED' ? '답변완료' : '진행중'}
                    </span>
                                        <span className="ml-auto text-xs text-muted-foreground">
                      {dayjs(q.createdAt).format('YYYY.MM.DD HH:mm')}
                    </span>
                                    </div>
                                    <Link
                                        href={`/me/qna/${q.id}`}
                                        className="block mt-1 text-sm hover:underline truncate"
                                    >
                                        {q.content}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page <= 0}
                            >
                                이전
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={data.content.length < size}
                            >
                                다음
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}