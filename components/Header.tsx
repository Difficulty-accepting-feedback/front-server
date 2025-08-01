'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // ShadCN Sheet for mobile menu
import { Search, Menu, Leaf } from "lucide-react" // X 아이콘 제거, Sheet로 대체

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("") // 검색 상태 추가 (트렌드: 실시간 피드백)

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900/80">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* 로고 영역 */}
                <Link href="/" className="text-2xl font-bold text-green-600 flex items-center transition-colors hover:text-green-700">
                    <Leaf className="w-6 h-6 mr-2 transition-transform duration-300 hover:rotate-12" />
                    Grow
                </Link>

                {/* 데스크톱 네비게이션 */}
                <nav className="hidden md:flex space-x-6 items-center">
                    <Link href="/categories" className="text-gray-600 hover:text-green-600 transition-colors">카테고리</Link>
                    <Link href="/matching" className="text-gray-600 hover:text-green-600 transition-colors">매칭</Link>
                    <Link href="/community" className="text-gray-600 hover:text-green-600 transition-colors">커뮤니티</Link>
                    <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">소개</Link>
                </nav>

                {/* 검색과 버튼 */}
                <div className="hidden md:flex items-center space-x-4">
                    <div className="relative">
                        <Input
                            placeholder="메이트 검색"
                            className="pl-10 pr-4 transition-shadow focus:shadow-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors hover:text-green-500" />
                    </div>
                    <Button variant="outline" className="transition-transform hover:scale-105">로그인</Button>
                    <Button className="bg-green-500 hover:bg-green-600 transition-transform hover:scale-105">회원가입</Button>
                </div>

                {/* 모바일 메뉴 (Sheet로 슬라이드 효과) */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="md:hidden p-0">
                            <Menu className="w-6 h-6 transition-transform duration-300 hover:rotate-90" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <nav className="flex flex-col space-y-4 mt-8">
                            <Link href="/categories" className="text-gray-600 hover:text-green-600 transition-colors">카테고리</Link>
                            <Link href="/matching" className="text-gray-600 hover:text-green-600 transition-colors">매칭</Link>
                            <Link href="/community" className="text-gray-600 hover:text-green-600 transition-colors">커뮤니티</Link>
                            <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">소개</Link>
                        </nav>
                        <div className="mt-6">
                            <Input
                                placeholder="메이트 검색"
                                className="pl-10 mb-4"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-[calc(50%+2rem)] transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Button variant="outline" className="w-full mb-2">로그인</Button>
                            <Button className="w-full bg-green-500 hover:bg-green-600">회원가입</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}

