import type {Metadata} from "next";
import {Geist, Geist_Mono, Inter} from "next/font/google";
import "./globals.css";
import Header from '@/components/Header' // 메인 페이지 헤더 컴포넌트
import Footer from '@/components/Footer' // 메인 페이지 푸터 컴포넌트
import {Toaster} from '@/components/ui/sonner'  // Shadcn 버전의 Sonner import

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: 'Grow - 성장 메이트 플랫폼', // 메인 페이지 제목 반영
    description: '공부 · 취미 메이트를 찾아 꿈을 함께 키우는 커뮤니티 플랫폼',
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className="h-full">
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}
        >
        <Header /> {/* 모든 페이지에 적용될 헤더 */}
        <main className="flex-1">{children}</main> {/* 남는 높이를 차지 */}
        <Footer /> {/* 모든 페이지에 적용될 푸터 */}
        <Toaster richColors /> {/* richColors로 성공/오류 색상 자동 적용 */}
        </body>
        </html>
    );
}