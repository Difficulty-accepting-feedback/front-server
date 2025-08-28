// components/notes/NoteMini.tsx
'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Check, Trash2 } from 'lucide-react'
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
import { useMemberNicknames } from '@/hooks/useMember'
import { toast } from 'sonner'

dayjs.locale('ko')

const MEMBER_BASE = process.env.NEXT_PUBLIC_MEMBER_BASE ?? 'http://localhost:8081'

type Props = {
    myId: number
    embedded?: boolean
}

/**
 * NoteMini: IME 안전 + inbox/outbox 탭 + id->nickname 매핑
 * 레이아웃:
 *  - flex column 전체(헤더 / 리스트(스크롤) / 입력(하단 고정))
 *  - 리스트는 flex-1 overflow-auto -> 입력은 항상 하단 고정
 */
export default function NoteMini({ myId, embedded = false }: Props) {
    // 페이징: UI에서 3건만 보이게 (서버에 size=3 요청)
    const [page, setPage] = useState(0)
    const size = 3

    const { data: unread = 0 } = useNoteUnreadCount(myId)
    const inboxQuery = useNoteInbox(myId, page, size)
    const outboxQuery = useNoteOutbox(myId, page, size)
    const markRead = useMarkNoteRead(myId)
    const delNote = useDeleteNote(myId)
    const sendNote = useSendNote(myId)

    const [mode, setMode] = useState<'inbox' | 'outbox'>('inbox')

    // IME 안전 입력 상태 (display vs committed)
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
        // debug
        return () => {}
    }, [])

    // 닉네임 -> memberId (resolve API)
    async function resolveMemberIdByNickname(nick: string): Promise<number> {
        const url = `${MEMBER_BASE}/api/members/resolve?nickname=${encodeURIComponent(nick.trim())}`
        const res = await fetch(url, { credentials: 'include' })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.message ?? `resolve 실패 (${res.status})`)
        const mid = body?.data?.memberId
        if (!mid) throw new Error('해당 닉네임 사용자를 찾을 수 없습니다.')
        return Number(mid)
    }

    // 핸들러들
    const onNicknameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayNickname(e.currentTarget.value)
    }, [])
    const onNicknameCompositionStart = useCallback(() => {
        composingNick.current = true
    }, [])
    const onNicknameCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
        composingNick.current = false
        const final = e.currentTarget.value
        setDisplayNickname(final)
        setCommittedNickname(final)
    }, [])
    const onNicknameBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            if (!composingNick.current) setCommittedNickname(displayNickname)
        },
        [displayNickname],
    )

    const onContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDisplayContent(e.currentTarget.value)
    }, [])
    const onContentCompositionStart = useCallback(() => {
        composingContent.current = true
    }, [])
    const onContentCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
        composingContent.current = false
        const final = e.currentTarget.value
        setDisplayContent(final)
        setCommittedContent(final)
    }, [])
    const onContentBlur = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            if (!composingContent.current) setCommittedContent(displayContent)
        },
        [displayContent],
    )

    const handleSend = useCallback(
        async (overrideNickname?: string, overrideContent?: string) => {
            if (composingNick.current || composingContent.current) {
                toast.error('입력이 완료된 후 전송해 주세요.')
                return
            }

            const sendNick = overrideNickname ?? displayNickname
            const sendContent = overrideContent ?? displayContent

            if (!sendNick.trim() || !sendContent.trim()) {
                toast.error('받는이와 내용을 입력해 주세요.')
                return
            }

            if (committedNickname !== sendNick) setCommittedNickname(sendNick)
            if (committedContent !== sendContent) setCommittedContent(sendContent)

            try {
                const recipientId = await resolveMemberIdByNickname(sendNick)
                await sendNote.mutateAsync({ recipientId, content: sendContent })
                toast.success('전송이 완료되었습니다.')
                setDisplayNickname('')
                setCommittedNickname('')
                setDisplayContent('')
                setCommittedContent('')
            } catch (err: any) {
                toast.error(err?.message ?? '쪽지 전송 중 오류가 발생했습니다.')
            }
        },
        [displayNickname, displayContent, committedNickname, committedContent, sendNote],
    )

    const notesQuery = mode === 'inbox' ? inboxQuery : outboxQuery
    const list = notesQuery.data?.content ?? []

    // id 목록(닉네임 매핑)
    const ids = React.useMemo(() => {
        const s = new Set<number>()
        for (const n of list) {
            if (typeof n.senderId === 'number') s.add(n.senderId)
            if (typeof n.recipientId === 'number') s.add(n.recipientId)
        }
        return Array.from(s)
    }, [list])

    const { data: nickMap } = useMemberNicknames(ids)

    const total = notesQuery.data?.totalElements ?? 0
    const totalPages = notesQuery.data?.totalPages ?? 0
    const currentPage = notesQuery.data?.page ?? page

    /* ----------------- 렌더링 ----------------- */
    // embedded 여부와 상관없이 컴포넌트 내부 레이아웃은 동일하게 flex-col.
    // parent가 팝업이면 parent에서 height를 지정(예: Rnd 내부 h-full).
    return (
        <div className="flex flex-col h-full min-h-0">
            {/* 헤더(탭 및 상태) */}
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

            {/* 리스트 영역: flex-1 + overflow-auto (입력창 고정을 위해 리스트만 스크롤) */}
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
                            const otherId = mode === 'inbox' ? n.senderId : n.recipientId
                            const member = nickMap ? nickMap[otherId] : undefined
                            const label = member?.nickname ?? `#${otherId}`

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

                {/* 페이지 네비 (리스트 영역에 포함되어 스크롤됨) */}
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

            {/* 입력 영역(항상 하단에 고정) */}
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