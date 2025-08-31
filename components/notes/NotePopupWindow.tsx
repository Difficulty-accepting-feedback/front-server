'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Rnd } from 'react-rnd'
import { X } from 'lucide-react'
import NoteMini from '@/components/notes/NoteMini'
import { cn } from '@/lib/utils'

type Props = {
    open: boolean
    onClose: () => void
    myId: number
    className?: string
}

export default function NotePopupWindow({ open, onClose, myId, className }: Props) {
    // ESC 닫기
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-[100]">
            {/* 오버레이: 클릭하면 닫히도록 */}
            <div className="absolute inset-0 bg-black/10" onClick={onClose} />

            <Rnd
                default={{
                    x: typeof window !== 'undefined' ? window.innerWidth - 480 : 100,
                    y: 80,
                    width: 440,
                    height: 640,
                }}
                minWidth={360}
                minHeight={480}
                bounds="window"
                dragHandleClassName="note-popup-drag-handle"
                enableResizing={{
                    bottom: true,
                    bottomLeft: true,
                    bottomRight: true,
                    left: true,
                    right: true,
                    top: true,
                    topLeft: true,
                    topRight: true,
                }}
                className={cn('pointer-events-auto shadow-2xl rounded-xl border bg-white dark:bg-gray-900 overflow-hidden', className)}
            >
                {/* 헤더 (드래그 핸들) */}
                <div className="note-popup-drag-handle flex items-center justify-between gap-2 px-3 py-2 border-b cursor-move select-none">
                    <div className="text-sm font-medium">쪽지</div>
                    <button aria-label="닫기" onClick={onClose} className="p-1 rounded hover:bg-muted">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* 내용: 중요한 변경점은 `pb-6` (하단 여유) */}
                <div className="flex-1 p-4 pb-16 h-full overflow-hidden">
                    {/* embedded 모드로 NoteMini 렌더 (NoteMini는 내부에서 리스트를 스크롤 처리) */}
                    <NoteMini myId={myId} embedded />
                </div>
            </Rnd>
        </div>,
        document.body
    )
}