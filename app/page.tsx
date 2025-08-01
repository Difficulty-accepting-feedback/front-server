'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import BoardPreview from "@/components/BoardPreview"
import {
  Users,
  BookOpen,
  Music,
  Dumbbell,
  Camera,
  Palette,
  Utensils,
  Code,
  Leaf,
  Star,
  Search,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Heart,
  Award,
  Target,
  TrendingUp,
  ArrowRight,
  Globe,
  Coffee,
  Gamepad2,
  Scissors,
  Bike,
  Briefcase
} from "lucide-react"

const categories = [
  { icon: <Code className="h-6 w-6" />, name: "프로그래밍", color: "bg-blue-500" },
  { icon: <BookOpen className="h-6 w-6" />, name: "언어학습", color: "bg-green-500" },
  { icon: <Music className="h-6 w-6" />, name: "음악", color: "bg-purple-500" },
  { icon: <Dumbbell className="h-6 w-6" />, name: "운동", color: "bg-red-500" },
  { icon: <Utensils className="h-6 w-6" />, name: "요리", color: "bg-orange-500" },
  { icon: <Camera className="h-6 w-6" />, name: "사진", color: "bg-pink-500" },
  { icon: <Palette className="h-6 w-6" />, name: "미술", color: "bg-indigo-500" },
  { icon: <Coffee className="h-6 w-6" />, name: "카페", color: "bg-amber-500" },
  { icon: <Gamepad2 className="h-6 w-6" />, name: "게임", color: "bg-cyan-500" },
  { icon: <Scissors className="h-6 w-6" />, name: "공예", color: "bg-rose-500" },
  { icon: <Bike className="h-6 w-6" />, name: "자전거", color: "bg-lime-500" },
  { icon: <Briefcase className="h-6 w-6" />, name: "스터디", color: "bg-teal-500" },
]

const testimonials = [
  {
    name: "김민수",
    role: "프론트엔드 개발자",
    content: "Grow를 통해 같은 관심사를 가진 개발자들과 스터디 그룹을 만들어 함께 성장했어요. 정말 좋은 플랫폼입니다!",
    rating: 5,
    avatar: "🧑‍💻"
  },
  {
    name: "이지영",
    role: "디자이너",
    content: "취미로 시작한 요리가 이제는 제 새로운 특기가 되었어요. 좋은 사람들과 함께하니 더욱 즐거웠습니다.",
    rating: 5,
    avatar: "👩‍🎨"
  },
  {
    name: "박준호",
    role: "대학생",
    content: "언어 교환 모임을 통해 영어 실력도 늘고 다양한 문화를 경험할 수 있었어요.",
    rating: 4,
    avatar: "🎓"
  }
]

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [showBoard, setShowBoard] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge
                  variant="outline"
                  className="mb-6 flex items-center gap-2 rounded-full border-emerald-300 bg-emerald-50 px-6 py-3 text-emerald-700 shadow-sm w-fit mx-auto"
              >
                <Sparkles className="h-4 w-4" />
                한 그루의 꿈을 심고, 함께 성장하세요
              </Badge>

              <h1 className="mb-8 text-5xl md:text-7xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                Grow
              </span>
              </h1>

              <p className="mb-12 max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed text-emerald-800">
                공부 · 취미 메이트를 찾아 꿈을 함께 키우는 커뮤니티 플랫폼
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                    size="lg"
                    className="px-8 py-6 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Link href="/login">함께 시작하기</Link>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => setShowBoard(prev => !prev)}
                >
                  둘러보기
                </Button>
              </div>
            </div>

            {/* 게시판 섹션 토글 */}
            {showBoard && <BoardPreview />}

            {/* Search Section */}
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-emerald-200 shadow-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-emerald-900">
                    관심사와 지역으로 그룹 찾기
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-emerald-500" />
                      <Input
                          placeholder="관심사를 검색해보세요 (예: 프로그래밍, 요리, 독서)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-12 border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-emerald-500" />
                      <Input
                          placeholder="지역을 입력해주세요"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="pl-10 h-12 border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
                      검색하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">
                왜 Grow를 선택해야 할까요?
              </h2>
              <p className="text-xl text-emerald-700 max-w-3xl mx-auto">
                개인의 성장부터 커뮤니티 형성까지, 모든 것이 가능한 플랫폼입니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                  icon={<Target className="h-12 w-12 text-emerald-600" />}
                  title="스터디 메이트"
                  description="같은 목표를 가진 사람들과 그룹을 만들고 함께 성장하세요."
                  gradient="from-emerald-500 to-teal-500"
              />
              <FeatureCard
                  icon={<Heart className="h-12 w-12 text-emerald-600" />}
                  title="취미 공유"
                  description="다양한 취미 활동을 통해 새로운 열정을 발견해 보세요."
                  gradient="from-teal-500 to-green-500"
              />
              <FeatureCard
                  icon={<TrendingUp className="h-12 w-12 text-emerald-600" />}
                  title="지속적 동기 부여"
                  description="커뮤니티와 함께라면 작은 성장도 큰 성취로 이어집니다."
                  gradient="from-green-500 to-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">
                인기 카테고리
              </h2>
              <p className="text-xl text-emerald-700 max-w-3xl mx-auto">
                다양한 분야에서 새로운 도전을 시작해보세요
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                  <Card
                      key={category.name}
                      className="group cursor-pointer border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-white/70 backdrop-blur-sm"
                  >
                    <CardHeader className="flex flex-col items-center justify-center space-y-4 py-8">
                      <div className={`p-4 rounded-full ${category.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                        {category.icon}
                      </div>
                      <CardTitle className="text-sm md:text-base text-center text-emerald-800 group-hover:text-emerald-900">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">
                사용자들의 이야기
              </h2>
              <p className="text-xl text-emerald-700 max-w-3xl mx-auto">
                실제 Grow 사용자들의 경험을 들어보세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                  <Card key={index} className="border-2 border-emerald-100 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{testimonial.avatar}</div>
                        <div>
                          <h4 className="font-semibold text-emerald-900">{testimonial.name}</h4>
                          <p className="text-sm text-emerald-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${
                                    i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                            />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-emerald-700 italic">"{testimonial.content}"</p>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              당신의 꿈을 현실로 만들어줄 동료들이 기다리고 있습니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                  size="lg"
                  className="px-8 py-6 text-lg bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg border-white text-white hover:bg-white hover:text-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                자세히 알아보기
              </Button>
            </div>
          </div>
        </section>
      </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
      <Card className="group cursor-pointer border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center text-center space-y-4 py-8">
          <div className={`p-4 rounded-full bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <CardTitle className="text-xl text-emerald-900 group-hover:text-emerald-700">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-emerald-700 group-hover:text-emerald-600">{description}</p>
        </CardContent>
      </Card>
  )
}
