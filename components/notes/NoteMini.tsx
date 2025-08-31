'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import {
    useDeleteNote,
    useMarkNoteRead,
    useNoteInbox,
    useNoteOutbox,
    useNoteUnreadCount,
    useSendNote,
} from '@/hooks/useNotes'
import { toast } from 'sonner'

dayjs.locale('ko')

type Props = {
    myId: number
    embedded?: boolean
}

export default function NoteMini({ myId, embedded = false }: Props) {
    const [page, setPage] = useState(0)
    const size = 3

    const { data: unread = 0 } = useNoteUnreadCount(myId)
    const inboxQuery = useNoteInbox(myId, page, size)
    const outboxQuery = useNoteOutbox(myId, page, size)
    const markRead = useMarkNoteRead(myId)
    const delNote = useDeleteNote(myId)
    const sendNote = useSendNote(myId)

    const [mode, setMode] = useState<'inbox' | 'outbox'>('inbox')

    // IME 안전 입력 상태
    const [displayNickname, setDisplayNickname] = useState('')
    const [committedNickname, setCommittedNickname] = useState('')
    const [displayContent, setDisplayContent] = useState('')
    const [committedContent, setCommittedContent] = useState('')

    const composingNick = useRef(false)
    const composingContent = useRef(false)

    const canSend =
        displayNickname.trim().length > 0 &&
        displayContent.trim().length > 0 &&
        !sendNote.isPending

    useEffect(() => {
        return () => {}
    }, [])

    // 입력 핸들러
    const onNicknameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayNickname(e.currentTarget.value)
    }, [])
    const onNicknameCompositionStart = useCallback(() => {
        composingNick.current = true
    }, [])
    const onNicknameCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
        composingNick.current = false
        const finalValue = e.currentTarget.value
        setDisplayNickname(finalValue)
        setCommittedNickname(finalValue)
    }, [])
    const onNicknameBlur = useCallback(() => {
        if (!composingNick.current) setCommittedNickname(displayNickname)
    }, [displayNickname])

    const onContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDisplayContent(e.currentTarget.value)
    }, [])
    const onContentCompositionStart = useCallback(() => {
        composingContent.current = true
    }, [])
    const onContentCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
        composingContent.current = false
        const finalValue = e.currentTarget.value
        setDisplayContent(finalValue)
        setCommittedContent(finalValue)
    }, [])
    const onContentBlur = useCallback(() => {
        if (!composingContent.current) setCommittedContent(displayContent)
    }, [displayContent])

    const handleSend = useCallback(
        async (overrideNickname?: string, overrideContent?: string) => {
            if (composingNick.current || composingContent.current) {
                toast.error('입력이 완료된 후 전송해 주세요.')
                return
            }

            const sendNick = (overrideNickname ?? displayNickname).trim()
            const sendContent = (overrideContent ?? displayContent).trim()

            if (!sendNick || !sendContent) {
                toast.error('받는이와 내용을 입력해 주세요.')
                return
            }

            if (committedNickname !== sendNick) setCommittedNickname(sendNick)
            if (committedContent !== sendContent) setCommittedContent(sendContent)

            try {
                // ✅ 닉네임으로 바로 전송
                await sendNote.mutateAsync({ recipientNickname: sendNick, content: sendContent })
                toast.success('전송이 완료되었습니다.')
                setDisplayNickname('')
                setCommittedNickname('')
                setDisplayContent('')
                setCommittedContent('')
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : '쪽지 전송 중 오류가 발생했습니다.'
                toast.error(msg)
            }
        },
        [displayNickname, displayContent, committedNickname, committedContent, sendNote],
    )

    const notesQuery = mode === 'inbox' ? inboxQuery : outboxQuery
    const list = notesQuery.data?.content ?? []

    const total = notesQuery.data?.totalElements ?? 0
    const totalPages = notesQuery.data?.totalPages ?? 0
    const currentPage = notesQuery.data?.page ?? page

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="px-3 py-2 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        className={`px-2 py-1 rounded text-sm ${mode === 'inbox' ? 'bg-emerald-600 text-white' : 'bg-transparent'}`}
                        onClick={() => { setMode('inbox'); setPage(0) }}
                    >
                        받은 쪽지
                    </button>
                    <button
                        className={`px-2 py-1 rounded text-sm ${mode === 'outbox' ? 'bg-emerald-600 text-white' : 'bg-transparent'}`}
                        onClick={() => { setMode('outbox'); setPage(0) }}
                    >
                        보낸 쪽지
                    </button>
                </div>
                <span className="text-xs text-muted-foreground">
          {mode === 'inbox' ? `읽지 않음 ${unread}개` : `총 ${total}건`}
        </span>
            </div>

            <div className="flex-1 overflow-auto px-0 min-h-0">
                {notesQuery.isLoading && (
                    <div className="p-4 space-y-2">
                        <div className="h-12 bg-emerald-100/40 animate-pulse rounded-md" />
                        <div className="h-12 bg-emerald-100/40 animate-pulse rounded-md" />
                    </div>
                )}

                {!notesQuery.isLoading && list.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                        {mode === 'inbox' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
                    </div>
                )}

                {!notesQuery.isLoading && list.length > 0 && (
                    <ul className="divide-y">
                        {list.map((n) => {
                            const label = mode === 'inbox' ? n.senderNickname : n.recipientNickname
                            return (
                                <li key={n.noteId} className="px-3 py-2 flex items-start gap-2">
                                    {!n.isRead && mode === 'inbox' && (
                                        <span className="mt-2 inline-block h-2 w-2 rounded-full bg-emerald-600" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {mode === 'inbox' ? `FROM ${label}` : `TO ${label}`}
                                            </Badge>
                                            <span className="ml-auto text-[11px] text-muted-foreground">
                        {dayjs(n.createdAt).format('YY.MM.DD HH:mm')}
                      </span>
                                        </div>
                                        <p className="text-sm mt-1 truncate">{n.content}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        {mode === 'inbox' && !n.isRead && (
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => markRead.mutate(n.noteId)}
                                                disabled={markRead.isPending}
                                                title="읽음"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => delNote.mutate(n.noteId)}
                                            disabled={delNote.isPending}
                                            title="삭제"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}

                <div className="px-3 py-2 flex items-center justify-between border-t text-sm">
                    <span>총 {total}건</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage <= 0}>
                            이전
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setPage(currentPage + 1)} disabled={currentPage + 1 >= totalPages}>
                            다음
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-3 border-t bg-transparent">
                <div className="text-xs text-muted-foreground mb-2">새 쪽지 보내기 (닉네임)</div>
                <div className="flex gap-2 mb-2">
                    <input
                        className="w-full border rounded-md px-2 py-1 bg-transparent"
                        placeholder="받는이 닉네임"
                        value={displayNickname}
                        onChange={onNicknameChange}
                        onCompositionStart={onNicknameCompositionStart}
                        onCompositionEnd={onNicknameCompositionEnd}
                        onBlur={onNicknameBlur}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
                <div className="mb-3">
          <textarea
              placeholder="내용을 입력하세요"
              value={displayContent}
              onChange={onContentChange}
              onCompositionStart={onContentCompositionStart}
              onCompositionEnd={onContentCompositionEnd}
              onBlur={onContentBlur}
              className="w-full border rounded-md p-2 min-h-[80px] bg-transparent"
              autoComplete="off"
              spellCheck={false}
          />
                </div>
                <div className="flex justify-end">
                    <Button onClick={() => handleSend()} disabled={!canSend} className="bg-emerald-600 hover:bg-emerald-700">
                        {sendNote.isPending ? '전송 중...' : '전송'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

const MemoizedNotePanel = React.memo(NoteMini)