'use client'
import { useNotificationSse } from '@/hooks/useNotifications'

export default function SseClient() {
    useNotificationSse({ bootstrapToastCount: 5, realtimeToast: true })
    return null
}