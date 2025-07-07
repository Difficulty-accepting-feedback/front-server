"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

// 더미 게시글 데이터 (추후 실제 데이터로 교체 필요)
const posts = [
    { id: 1, title: "프론트엔드 스터디 모집합니다", author: "민수", date: "2025-07-06" },
    { id: 2, title: "React 취미 프로젝트 같이 해요", author: "지영", date: "2025-07-05" },
    { id: 3, title: "러닝 크루에 관심 있으신 분?", author: "준호", date: "2025-07-04" },
    { id: 4, title: "오운완 사진 같이 남겨요 🏃‍♂️", author: "수연", date: "2025-07-03" },
]

export default function BoardPreview() {
    return (
        <section id="board" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-bold text-emerald-900">자유 게시판</h2>
                    <Link
                        href="/board"
                        className="flex items-center text-emerald-700 hover:text-emerald-900 font-medium"
                    >
                        전체보기
                        <ArrowRight className="ml-1 h-5 w-5" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <Card
                            key={post.id}
                            className="group cursor-pointer border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-white/70 backdrop-blur-sm"
                        >
                            <CardHeader className="flex justify-between items-center px-4 pt-4">
                                <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                                    {post.date}
                                </Badge>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <h3 className="text-lg font-semibold text-emerald-900 group-hover:text-emerald-700 mb-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-emerald-700">작성자: {post.author}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
