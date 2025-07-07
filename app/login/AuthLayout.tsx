"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Left visual */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-100 via-teal-100 to-green-100 items-center justify-center relative">
                {/* 홈으로 이동하는 아이콘과 텍스트: 메인 페이지와 동일한 스타일 */}
                <Link href="/" className="absolute top-6 left-6 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Grow
          </span>
                </Link>

                <div className="text-center px-12">
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                        Grow
                    </h1>
                    <p className="text-emerald-800 text-xl">
                        한 그루의 꿈을 심고 <br /> 함께 성장하세요
                    </p>
                </div>
            </div>

            {/* Right auth card */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                {children}
            </div>
        </div>
    )
}
