'use client'

import {useState, useMemo} from 'react'
import dayjs from 'dayjs'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import type {QnaThreadNode} from '@/lib/qna-api'
import {useCreateAnswer, useCreateFollowUp} from '@/hooks/useQna'

type Mode = 'me' | 'admin'

/** 트리를 createdAt 기준 평탄화 */
function flattenByTime(root: QnaThreadNode): QnaThreadNode[] {
    const acc: QnaThreadNode[] = []
    const stack: QnaThreadNode[] = [root]
    while (stack.length) {
        const n = stack.pop()!
        acc.push(n)
        const children = [...(n.children ?? [])].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        for (let i = children.length - 1; i >= 0; i--) stack.push(children[i])
    }
    acc.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    return acc
}

function InlineComposer({
                            placeholder,
                            onSubmit,
                            submitText = '등록',
                        }: {
    placeholder: string
    submitText?: string
    /** mutateAsync 반환값과 호환되도록 Promise<unknown> 허용 */
    onSubmit: (text: string) => Promise<unknown> | void
}) {
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [busy, setBusy] = useState(false)

    const handle = async () => {
        if (!text.trim()) return
        setBusy(true)
        try {
            await onSubmit(text.trim())
            setText('')
            setOpen(false)
        } finally {
            setBusy(false)
        }
    }

    if (!open) {
        return (
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                {submitText === '등록' ? '작성' : submitText}
            </Button>
        )
    }

    return (
        <div className="mt-2 space-y-2">
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-[120px] resize-none"
            />
            <div className="flex gap-2">
                <Button size="sm" onClick={handle} disabled={!text.trim() || busy}>
                    {submitText}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                    취소
                </Button>
            </div>
        </div>
    )
}

export default function QnaThreadLinearView({
                                                root,
                                                mode,
                                            }: {
    root: QnaThreadNode
    mode: Mode
}) {
    const items = useMemo(() => flattenByTime(root), [root])
    const ansMut = useCreateAnswer()
    const folMut = useCreateFollowUp()

    return (
        <div className="border border-emerald-200 rounded-md overflow-hidden bg-white/70 dark:bg-gray-900/20">
            <ul className="divide-y divide-emerald-200">
                {items.map((n) => {
                    const canAnswer = mode === 'admin' && n.type === 'QUESTION'
                    const canFollow = mode === 'me' && n.type === 'ANSWER'

                    return (
                        <li key={n.id} className="flex flex-col p-4">
                            {/* 상단 라벨 + 시간 */}
                            <div className="flex items-center gap-2">
                                <Badge className={n.type === 'QUESTION' ? 'bg-emerald-600' : 'bg-sky-600'}>
                                    {n.type === 'QUESTION' ? '질문' : '답변'}
                                </Badge>
                                <span className="ml-auto text-xs text-muted-foreground">
                  {dayjs(n.createdAt).format('YY.MM.DD HH:mm')}
                </span>
                            </div>

                            {/* 본문 */}
                            <p className="mt-2 text-sm whitespace-pre-wrap">{n.content}</p>

                            {/* 작성/추가 버튼 */}
                            {(canAnswer || canFollow) && (
                                <div className="mt-3">
                                    {canAnswer && (
                                        <InlineComposer
                                            placeholder="답변 내용을 입력하세요"
                                            onSubmit={(t) => ansMut.mutateAsync({questionId: n.id, content: t})}
                                        />
                                    )}
                                    {canFollow && (
                                        <InlineComposer
                                            placeholder="추가 질문을 입력하세요"
                                            onSubmit={(t) => folMut.mutateAsync({answerId: n.id, content: t})}
                                        />
                                    )}
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}