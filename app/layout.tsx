import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'

/* Mantine 스타일 임포트 */
import '@mantine/core/styles.css'

import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from '@mantine/core'

import Header from '@/components/Header' // 메인 페이지 헤더
import Footer from '@/components/Footer' // 메인 페이지 푸터
import { Toaster } from '@/components/ui/sonner' // Shadcn Sonner
import Providers from './providers'
import SseClient from "@/app/sse-client"; // React Query 등 공용 Provider
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.layer.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Grow - 성장 메이트 플랫폼',
    description: '공부 · 취미 메이트를 찾아 꿈을 함께 키우는 커뮤니티 플랫폼',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko" {...mantineHtmlProps}>
        <head>
            {/* Mantine 색상 모드 스크립트 */}
            <ColorSchemeScript />
        </head>
        <body
            className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {/* MantineProvider를 layout에서 직접 적용 */}
        <MantineProvider>
            {/* React Query 등 다른 Provider */}
            <Providers>
                <SseClient />
                {/* 모든 페이지에 적용될 공통 UI */}
                <Header />
                <main className="min-h-screen">{children}</main>
                <Footer />

                {/* 전역 알림 */}
                <Toaster />
            </Providers>
        </MantineProvider>
        </body>
        </html>
    )
}