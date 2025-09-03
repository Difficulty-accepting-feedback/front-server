'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Props = {
    placeholder: string
    submitText?: string
    onSubmit: (text: string) => Promise<void> | void
    onCancel?: () => void
}

export default function QnaComposer({ placeholder, submitText='등록', onSubmit, onCancel }: Props) {
    const [text, setText] = useState('')
    const [busy, setBusy] = useState(false)

    const handle = async () => {
        if (!text.trim()) return
        try {
            setBusy(true)
            await onSubmit(text.trim())
            setText('')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="space-y-2">
            <Textarea
                value={text}
                onChange={(e)=>setText(e.target.value)}
                placeholder={placeholder}
            />
            <div className="flex gap-2">
                <Button size="sm" onClick={handle} disabled={!text.trim() || busy}>
                    {submitText}
                </Button>
                {onCancel && (
                    <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
                        취소
                    </Button>
                )}
            </div>
        </div>
    )
}