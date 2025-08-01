'use client'

import {useState} from "react"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {Badge} from "@/components/ui/badge"
import {
    Search,
    Menu,
    Leaf,
    LogOut,
    User,
    Bell,
    Coins,
    Activity,
    Home,
    BookOpen,
    Palette,
    Users,
    LayoutDashboard, ShoppingCart, Brain, Settings
} from "lucide-react"

export default function Header() {
    // 로그인된 상태라면 true, 실제 프로젝트에서는 Auth 연동
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    // 예시 사용자 객체
    const user = {
        nickname: "GrowUser123",
        avatarUrl: "https://github.com/shadcn.png",
        point: 10200,
        notifications: 2,
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
        // 실제 로그아웃 로직 연결!
    }

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900/80">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* 로고 */}
                <Link href="/"
                      className="text-2xl font-bold text-green-600 flex items-center transition-colors hover:text-green-700">
                    <Leaf className="w-6 h-6 mr-2 transition-transform duration-300 hover:rotate-12"/>
                    Grow
                </Link>

                {/* 데스크톱 네비게이션 */}
                <nav className="hidden md:flex space-x-6 items-center">
                    <Link href="/categories" className="text-gray-600 hover:text-green-600 transition-colors">스터디</Link>
                    <Link href="/hobby" className="text-gray-600 hover:text-green-600 transition-colors">취미</Link>
                    <Link href="/mentoring" className="text-gray-600 hover:text-green-600 transition-colors">멘토링</Link>
                    <Link href="/matching" className="text-gray-600 hover:text-green-600 transition-colors">매칭</Link>
                    <Link href="/friends" className="text-gray-600 hover:text-green-600 transition-colors">친구</Link>
                </nav>

                {/* 검색 + 사용자/버튼 */}
                <div className="hidden md:flex items-center space-x-4">
                    <div className="relative">
                        <Input
                            placeholder="메이트 검색"
                            className="pl-10 pr-4 transition-shadow focus:shadow-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors hover:text-green-500"/>
                    </div>
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center space-x-2 cursor-pointer">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} alt={user.nickname}/>
                                        <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-600 font-medium">{user.nickname}</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-2">
                                <DropdownMenuLabel className="flex flex-col items-start gap-2 pb-2">
                                    <span className="text-xs text-muted-foreground">성실성 점수</span>
                                    <span className="text-green-600 font-bold text-lg flex items-center gap-1">
      <Coins className="w-5 h-5 mr-1" />
                                        {user.point.toLocaleString()}<span className="text-xs text-gray-400 ml-1">원</span>
    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/notifications" className="flex items-center w-full relative">
                                        <Bell className="w-4 h-4 mr-2" /> {/* Bell 아이콘 */}
                                        알림
                                        {user.notifications > 0 && (
                                            <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 flex items-center justify-center">
                                                {user.notifications}
                                            </Badge>
                                        )}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/" className="flex items-center w-full">
                                        <Home className="w-4 h-4 mr-2" /> {/* Home 아이콘 */}
                                        홈
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/study" className="flex items-center w-full">
                                        <BookOpen className="w-4 h-4 mr-2" /> {/* BookOpen 아이콘 */}
                                        스터디
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/hobby" className="flex items-center w-full">
                                        <Palette className="w-4 h-4 mr-2" /> {/* Palette 아이콘 */}
                                        취미
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/mentoring" className="flex items-center w-full">
                                        <Users className="w-4 h-4 mr-2" /> {/* Users 아이콘 */}
                                        멘토링
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="flex items-center w-full">
                                        <LayoutDashboard className="w-4 h-4 mr-2" /> {/* LayoutDashboard 아이콘 */}
                                        대시보드
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/purchase-history" className="flex items-center w-full">
                                        <ShoppingCart className="w-4 h-4 mr-2" /> {/* ShoppingCart 아이콘 */}
                                        구매 내역
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/ai-coaching" className="flex items-center w-full">
                                        <Brain className="w-4 h-4 mr-2" /> {/* Brain 아이콘 */}
                                        AI 코칭
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="flex items-center w-full">
                                        <Settings className="w-4 h-4 mr-2" /> {/* Settings 아이콘 */}
                                        설정
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    로그아웃
                                </DropdownMenuItem>
                            </DropdownMenuContent>

                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="outline" className="transition-transform hover:scale-105">로그인</Button>
                            <Button
                                className="bg-green-500 hover:bg-green-600 transition-transform hover:scale-105">회원가입</Button>
                        </>
                    )}
                </div>

                {/* 모바일 Sheet 메뉴 */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="md:hidden p-0">
                            <Menu className="w-6 h-6 transition-transform duration-300 hover:rotate-90"/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <nav className="flex flex-col space-y-4 mt-8">
                            <Link href="/categories"
                                  className="text-gray-600 hover:text-green-600 transition-colors">카테고리</Link>
                            <Link href="/matching"
                                  className="text-gray-600 hover:text-green-600 transition-colors">매칭</Link>
                            <Link href="/community"
                                  className="text-gray-600 hover:text-green-600 transition-colors">커뮤니티</Link>
                            <Link href="/about"
                                  className="text-gray-600 hover:text-green-600 transition-colors">소개</Link>
                        </nav>
                        <div className="mt-6">
                            <Input
                                placeholder="메이트 검색"
                                className="pl-10 mb-4"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search
                                className="absolute left-3 top-[calc(50%+2rem)] transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            {isLoggedIn ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center space-x-2 mt-2 cursor-pointer">
                                            <Avatar>
                                                <AvatarImage src={user.avatarUrl} alt={user.nickname}/>
                                                <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-gray-600 font-medium">{user.nickname}</span>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 p-2">
                                        <DropdownMenuLabel className="flex flex-col items-start gap-2 pb-2">
                                            <span className="text-xs text-muted-foreground">성실성 점수</span>
                                            <span className="text-green-600 font-bold text-lg flex items-center gap-1">
                        <Coins className="w-5 h-5 mr-1"/>
                                                {user.point.toLocaleString()}<span
                                                className="text-xs text-gray-400 ml-1">원</span>
                      </span>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem asChild>
                                            <Link href="/user/notifications" className="flex items-center w-full">
                                                <Bell className="w-4 h-4 mr-2"/>
                                                알림
                                                {user.notifications > 0 && (
                                                    <span
                                                        className="ml-2 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                            {user.notifications}
                          </span>
                                                )}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/user/profile" className="flex items-center w-full">
                                                <User className="w-4 h-4 mr-2"/>
                                                마이페이지
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/user/history" className="flex items-center w-full">
                                                <Activity className="w-4 h-4 mr-2"/>
                                                활동 내역
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem onClick={handleLogout}
                                                          className="text-red-500 cursor-pointer">
                                            <LogOut className="w-4 h-4 mr-2"/>
                                            로그아웃
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Button variant="outline" className="w-full mb-2">로그인</Button>
                                    <Button className="w-full bg-green-500 hover:bg-green-600">회원가입</Button>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}