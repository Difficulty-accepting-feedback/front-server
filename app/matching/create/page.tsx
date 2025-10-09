'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Sprout, Calendar, MapPin, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { MATCHING_BASE_URL } from '@/lib/env'

// Enum 타입 정의
enum Category { STUDY = 'STUDY', HOBBY = 'HOBBY', MENTORING = 'MENTORING' }
enum MostActiveTime { MORNING = 'MORNING', AFTERNOON = 'AFTERNOON', EVENING = 'EVENING', DAWN = 'DAWN' }
enum Level { SEED = 'SEED', SEEDLING = 'SEEDLING', SAPLING = 'SAPLING', BLOOMING = 'BLOOMING', FRUITFUL = 'FRUITFUL' }
enum Age { TEENS = 'TEENS', TWENTIES = 'TWENTIES', THIRTIES = 'THIRTIES', FORTIES = 'FORTIES', FIFTIES = 'FIFTIES', SIXTIES = 'SIXTIES', NONE = 'NONE' }

export default function CreateMatching() {
    const [swiper, setSwiper] = useState<any>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [formData, setFormData] = useState({
        category: '' as Category,
        mostActiveTime: '' as MostActiveTime,
        level: '' as Level,
        age: '' as Age,
        isAttending: false,
        introduction: ''
    })

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNext = () => {
        if (swiper) swiper.slideNext()
    }

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${MATCHING_BASE_URL}/api/matching/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })
            if (response.ok) {
                toast.success('매칭 정보가 저장되었습니다!', { description: 'Grow와 함께 성장하세요!' })
            } else {
                toast.error('저장에 실패했습니다.', { description: '다시 시도해주세요.' })
            }
        } catch (error) {
            toast.error('네트워크 오류가 발생했습니다.', { description: '인터넷 연결을 확인하세요.' })
        }
    }

    const slides = [
        {
            icon: <Users className="w-8 h-8 text-blue-500 transition-transform duration-300 hover:scale-110" />,
            title: '어떤 카테고리에서 매칭을 찾으시나요?',
            content: (
                <Select onValueChange={(val) => handleChange('category', val as Category)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={Category.STUDY}>공부 (STUDY)</SelectItem>
                        <SelectItem value={Category.HOBBY}>취미 (HOBBY)</SelectItem>
                        <SelectItem value={Category.MENTORING}>멘토링 (MENTORING)</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            icon: <Clock className="w-8 h-8 text-green-500 transition-transform duration-300 hover:scale-110" />,
            title: '가장 활동적인 시간대는 언제인가요?',
            content: (
                <Select onValueChange={(val) => handleChange('mostActiveTime', val as MostActiveTime)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="시간대 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={MostActiveTime.MORNING}>아침 (06:00 ~ 12:00)</SelectItem>
                        <SelectItem value={MostActiveTime.AFTERNOON}>오후 (12:00 ~ 18:00)</SelectItem>
                        <SelectItem value={MostActiveTime.EVENING}>저녁 (18:00 ~ 00:00)</SelectItem>
                        <SelectItem value={MostActiveTime.DAWN}>새벽 (00:00 ~ 06:00)</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            icon: <Sprout className="w-8 h-8 text-yellow-500 transition-transform duration-300 hover:scale-110" />,
            title: '당신의 레벨은 어느 정도인가요?',
            content: (
                <Select onValueChange={(val) => handleChange('level', val as Level)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="레벨 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={Level.SEED}>씨앗 (초보자)</SelectItem>
                        <SelectItem value={Level.SEEDLING}>새싹 (기초)</SelectItem>
                        <SelectItem value={Level.SAPLING}>나무 (일상 활용)</SelectItem>
                        <SelectItem value={Level.BLOOMING}>꽃 (능숙)</SelectItem>
                        <SelectItem value={Level.FRUITFUL}>열매 (전문가)</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            icon: <Calendar className="w-8 h-8 text-purple-500 transition-transform duration-300 hover:scale-110" />,
            title: '당신의 연령대는 어떻게 되나요?',
            content: (
                <Select onValueChange={(val) => handleChange('age', val as Age)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="연령대 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={Age.TEENS}>10대</SelectItem>
                        <SelectItem value={Age.TWENTIES}>20대</SelectItem>
                        <SelectItem value={Age.THIRTIES}>30대</SelectItem>
                        <SelectItem value={Age.FORTIES}>40대</SelectItem>
                        <SelectItem value={Age.FIFTIES}>50대</SelectItem>
                        <SelectItem value={Age.SIXTIES}>60대 이상</SelectItem>
                        <SelectItem value={Age.NONE}>선택 없음</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            icon: <MapPin className="w-8 h-8 text-red-500 transition-transform duration-300 hover:scale-110" />,
            title: '오프라인 모임에 참석하시나요?',
            content: (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={formData.isAttending}
                        onCheckedChange={(checked) => handleChange('isAttending', checked)}
                    />
                    <span className="text-sm font-medium">{formData.isAttending ? '네, 참석합니다' : '아니오, 온라인만'}</span>
                </div>
            )
        },
        {
            icon: <Pencil className="w-8 h-8 text-indigo-500 transition-transform duration-300 hover:scale-110" />,
            title: '자기소개를 간단히 작성해주세요 (10~500자)',
            content: (
                <Textarea
                    placeholder="당신의 관심사와 목표를 알려주세요!"
                    value={formData.introduction}
                    onChange={(e) => handleChange('introduction', e.target.value)}
                    className="min-h-[100px] resize-none"
                />
            )
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-50 p-4 md:p-8 backdrop-blur-sm dark:from-gray-800 dark:to-gray-900">
            <Card className="max-w-2xl mx-auto rounded-xl shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md relative">
                {/* 커스텀 네비게이션 버튼 */}
                <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-emerald-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-2 shadow transition disabled:opacity-40"
                    onClick={() => swiper?.slidePrev()}
                    disabled={activeIndex === 0}
                    aria-label="이전"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-emerald-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-2 shadow transition disabled:opacity-40"
                    onClick={() => swiper?.slideNext()}
                    disabled={activeIndex === slides.length - 1}
                    aria-label="다음"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold">새로운 매칭 만들기</CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">Grow와 함께 성장할 메이트를 찾아보세요!</p>
                </CardHeader>
                <CardContent>
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={30}
                        slidesPerView={1}
                        onSwiper={setSwiper}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                        navigation={false} // 내장 버튼 사용 X
                        className="w-full transition-all duration-300"
                    >
                        {slides.map((slide, index) => (
                            <SwiperSlide key={index}>
                                <div className="flex flex-col items-center space-y-6 p-6">
                                    <Badge variant="secondary" className="text-base px-3 py-1 rounded-full">
                                        {index + 1} / {slides.length}
                                    </Badge>
                                    {slide.icon}
                                    <h3 className="text-xl font-medium text-center">{slide.title}</h3>
                                    {slide.content}
                                    {index < slides.length - 1 ? (
                                        <Button onClick={handleNext} className="mt-4 transition-transform duration-200 hover:scale-105">다음으로</Button>
                                    ) : (
                                        <Button onClick={handleSubmit} className="mt-4 transition-transform duration-200 hover:scale-105">매칭 생성하기</Button>
                                    )}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </CardContent>
            </Card>
        </div>
    )
}