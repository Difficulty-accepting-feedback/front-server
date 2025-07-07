// app/(auth)/login/page.tsx
"use client"

import AuthLayout from "./AuthLayout"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Chrome,
    Smile,       // 카카오
    MessageCircleMore, // 네이버
    Eye,
    EyeOff,
} from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPwd, setShowPwd] = useState(false)

    return (
        <AuthLayout>
            <Card className="w-full max-w-sm border border-emerald-200 shadow-lg backdrop-blur-md bg-white/60 hover:scale-105 transition-transform duration-300">
                {/* 상단 상태 알림 */}
                <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-sm text-center py-2">
                    최근 구글 계정으로 로그인하였습니다
                </div>

                <CardHeader className="flex flex-col items-center space-y-2 pt-6">
                    <CardTitle className="text-2xl font-bold text-emerald-900">
                        GROW LOGIN
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 px-6 py-4">
                    {/* 이메일 */}
                    <Input
                        placeholder="이메일을 입력해 주세요"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="h-12 border-emerald-200 focus:border-emerald-500"
                    />

                    {/* 비밀번호 */}
                    <div className="relative">
                        <Input
                            placeholder="비밀번호를 입력해 주세요"
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="h-12 pr-10 border-emerald-200 focus:border-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                        >
                            {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* 로그인 버튼 */}
                    <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium">
                        로그인하기
                    </Button>

                    {/* 이메일 회원가입 링크 */}
                    <Link
                        href="/signup"
                        className="block text-center text-emerald-700 hover:underline"
                    >
                        이메일 회원가입
                    </Link>
                </CardContent>

                <CardFooter className="flex flex-col items-center space-y-3 pb-6">
                    <span className="text-sm text-emerald-500">SNS 계정으로 간편하게 시작하기</span>
                    <div className="flex gap-4">
                        <button
                            onClick={() => signIn("google")}
                            className="p-2 bg-white border border-emerald-100 rounded-full shadow hover:shadow-md transition"
                            aria-label="Google 로그인"
                        >
                            <Chrome className="h-6 w-6 text-[#EA4335]" />
                        </button>
                        <button
                            onClick={() => signIn("kakao")}
                            className="p-2 bg-white border border-emerald-100 rounded-full shadow hover:shadow-md transition"
                            aria-label="Kakao 로그인"
                        >
                            <Smile className="h-6 w-6 text-[#3C1E1E]" />
                        </button>
                        <button
                            onClick={() => signIn("naver")}
                            className="p-2 bg-white border border-emerald-100 rounded-full shadow hover:shadow-md transition"
                            aria-label="Naver 로그인"
                        >
                            <MessageCircleMore className="h-6 w-6 text-[#03C75A]" />
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </AuthLayout>
    )
}
