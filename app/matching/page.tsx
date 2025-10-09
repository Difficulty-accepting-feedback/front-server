'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Clock, Sprout, Calendar, MapPin, Pencil, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { MATCHING_BASE_URL } from '@/lib/env'
import Link from "next/link";

// Enum 타입 정의
enum Category { STUDY = 'STUDY', HOBBY = 'HOBBY', MENTORING = 'MENTORING' }
enum MostActiveTime { MORNING = 'MORNING', AFTERNOON = 'AFTERNOON', EVENING = 'EVENING', DAWN = 'DAWN' }
enum Level { SEED = 'SEED', SEEDLING = 'SEEDLING', SAPLING = 'SAPLING', BLOOMING = 'BLOOMING', FRUITFUL = 'FRUITFUL' }
enum Age { TEENS = 'TEENS', TWENTIES = 'TWENTIES', THIRTIES = 'THIRTIES', FORTIES = 'FORTIES', FIFTIES = 'FIFTIES', SIXTIES = 'SIXTIES', NONE = 'NONE' }

// MatchingResponse 타입 (id 추가)
interface MatchingResponse {
    id: number // 매칭 ID 추가
    category: Category
    mostActiveTime: MostActiveTime
    level: Level
    age: Age
    isAttending: boolean
    introduction: string
}

// 더미 데이터 추가 (id 포함)
const dummyMatchings: MatchingResponse[] = [
    {
        id: 1,
        category: Category.STUDY,
        mostActiveTime: MostActiveTime.AFTERNOON,
        level: Level.SEEDLING,
        age: Age.TWENTIES,
        isAttending: true,
        introduction: '공부 메이트를 찾고 있어요! 함께 성장해요.'
    },
    {
        id: 2,
        category: Category.STUDY,
        mostActiveTime: MostActiveTime.EVENING,
        level: Level.SAPLING,
        age: Age.THIRTIES,
        isAttending: false,
        introduction: '온라인으로 책 읽기 스터디 원해요.'
    },
    {
        id: 3,
        category: Category.STUDY,
        mostActiveTime: MostActiveTime.MORNING,
        level: Level.BLOOMING,
        age: Age.NONE,
        isAttending: true,
        introduction: '전문가와 멘토링 세션 희망합니다.'
    }
]

export default function MatchingCheck() {
    const [category, setCategory] = useState<Category>(Category.STUDY)
    const [matchings, setMatchings] = useState<MatchingResponse[]>([]) // 초기 빈 배열 설정
    const [loading, setLoading] = useState(false)
    const [selectedMatching, setSelectedMatching] = useState<MatchingResponse | null>(null) // 선택된 매칭 상태
    const [editMode, setEditMode] = useState(false) // 편집 모드 상태
    const [editedData, setEditedData] = useState<Partial<MatchingResponse>>({}) // 수정된 데이터 상태
    const [isModalOpen, setIsModalOpen] = useState(false) // 모달 열림 상태

    useEffect(() => {
        const fetchMatchings = async () => {
            setLoading(true)
            try {
                const response = await fetch(`${MATCHING_BASE_URL}/api/v1/matching/check?category=${category}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })

                const data = await response.json()

                if (data.code === '200') {
                    setMatchings(data.data || [])
                    toast.success('매칭 목록을 불러왔습니다!', { duration: 2000 })
                } else {
                    setMatchings([])
                    toast.error('매칭 조회에 실패했습니다.')
                }
            } catch (error) {
                setMatchings([])
                toast.error('네트워크 오류가 발생했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchMatchings()
    }, [category])

    const openModal = (matching: MatchingResponse) => {
        setSelectedMatching(matching)
        setEditedData(matching) // 초기 편집 데이터 설정
        setEditMode(false) // 뷰 모드로 시작
        setIsModalOpen(true)
    }

    const handleEditChange = (field: keyof MatchingResponse, value: any) => {
        setEditedData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!selectedMatching?.id) return

        // 간단한 유효성 검사 (introduction 길이)
        if (editedData.introduction && (editedData.introduction.length < 10 || editedData.introduction.length > 500)) {
            toast.error('자기소개는 10~500자 사이로 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`${MATCHING_BASE_URL}/api/v1/matching/update/${selectedMatching.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedData),
                credentials: 'include'
            })

            const data = await response.json()

            if (data.code === '200') {
                toast.success('매칭 정보가 수정되었습니다!')
                setIsModalOpen(false)
                // 목록 새로고침 (재조회)
                const refreshResponse = await fetch(`${MATCHING_BASE_URL}/api/v1/matching/check?category=${category}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })

                const refreshData = await refreshResponse.json()

                if (refreshData.code === '200') {
                    setMatchings(refreshData.data.length > 0 ? refreshData.data : dummyMatchings)
                }
            } else {
                toast.error('수정에 실패했습니다.')
            }
        } catch (error) {
            toast.error('네트워크 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8 dark:from-gray-900 dark:to-gray-800">
            <Card className="max-w-4xl mx-auto rounded-lg shadow-md bg-white/90 dark:bg-gray-800/90">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold">카테고리별 매칭 조회</CardTitle>
                    <p className="text-muted-foreground text-sm mt-2">카테고리를 선택하면 매칭 목록이 업데이트됩니다!</p>
                </CardHeader>
                <CardContent>
                    <div className="mb-8"> {/* 카테고리 선택 부분 아래에 공백 추가 */}
                        <Select value={category} onValueChange={(val) => setCategory(val as Category)}>
                            <SelectTrigger className="w-[220px] mx-auto">
                                <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={Category.STUDY}>공부 (STUDY)</SelectItem>
                                <SelectItem value={Category.HOBBY}>취미 (HOBBY)</SelectItem>
                                <SelectItem value={Category.MENTORING}>멘토링 (MENTORING)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-4"> {/* 데이터 표시 부분 위에 약간의 텀 추가 */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-2">
                                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                <p className="text-sm text-muted-foreground">매칭을 불러오는 중...</p>
                            </div>
                        ) : matchings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-2 text-muted-foreground">
                                <AlertCircle className="w-8 h-8" />
                                <p>해당 카테고리에 매칭이 없습니다. 새로 작성해 보세요!</p>
                                <Link href="/matching/create">
                                    <Button>작성하기</Button>
                                </Link>
                            </div>
                        ) : (
                            <Swiper
                                modules={[Navigation]}
                                spaceBetween={16}
                                slidesPerView={1}
                                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                                navigation
                                className="w-full"
                            >
                                {matchings.map((matching, index) => (
                                    <SwiperSlide key={index}>
                                        <Card
                                            className="p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-white dark:bg-gray-700 cursor-pointer"
                                            onClick={() => openModal(matching)} // 클릭 시 모달 열기
                                        >
                                            <CardHeader className="pb-2">
                                                <Badge variant="secondary" className="text-sm">{matching.category}</Badge>
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <Clock className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span>{matching.mostActiveTime}</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Sprout className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                                    <span>{matching.level}</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                                    <span>{matching.age}</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                    <span>{matching.isAttending ? '오프라인 참석' : '온라인만'}</span>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <Pencil className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{matching.introduction}</p> {/* 요약 표시 */}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 상세 보기 모달 */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">매칭 상세 정보</DialogTitle>
                    </DialogHeader>
                    {selectedMatching && (
                        <div className="space-y-4 text-sm">
                            {!editMode ? (
                                <>
                                    <div className="flex items-center space-x-3">
                                        <Badge variant="secondary">{selectedMatching.category}</Badge>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-green-500" />
                                        <span>활동 시간: {selectedMatching.mostActiveTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Sprout className="w-5 h-5 text-yellow-500" />
                                        <span>레벨: {selectedMatching.level}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-purple-500" />
                                        <span>연령대: {selectedMatching.age}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-red-500" />
                                        <span>오프라인 참석: {selectedMatching.isAttending ? '예' : '아니오'}</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Pencil className="w-5 h-5 text-indigo-500 mt-1" />
                                        <p className="text-gray-600 dark:text-gray-300">{selectedMatching.introduction}</p>
                                    </div>
                                    <Button onClick={() => setEditMode(true)} className="mt-4 w-full">수정하기</Button>
                                </>
                            ) : (
                                <>
                                    <Select
                                        value={editedData.mostActiveTime || selectedMatching.mostActiveTime}
                                        onValueChange={(val) => handleEditChange('mostActiveTime', val as MostActiveTime)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="활동 시간대" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={MostActiveTime.MORNING}>아침</SelectItem>
                                            <SelectItem value={MostActiveTime.AFTERNOON}>오후</SelectItem>
                                            <SelectItem value={MostActiveTime.EVENING}>저녁</SelectItem>
                                            <SelectItem value={MostActiveTime.DAWN}>새벽</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={editedData.level || selectedMatching.level}
                                        onValueChange={(val) => handleEditChange('level', val as Level)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="레벨" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={Level.SEED}>씨앗</SelectItem>
                                            <SelectItem value={Level.SEEDLING}>새싹</SelectItem>
                                            <SelectItem value={Level.SAPLING}>나무</SelectItem>
                                            <SelectItem value={Level.BLOOMING}>꽃</SelectItem>
                                            <SelectItem value={Level.FRUITFUL}>열매</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={editedData.age || selectedMatching.age}
                                        onValueChange={(val) => handleEditChange('age', val as Age)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="연령대" />
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
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={editedData.isAttending ?? selectedMatching.isAttending}
                                            onCheckedChange={(checked) => handleEditChange('isAttending', checked)}
                                        />
                                        <span>오프라인 참석</span>
                                    </div>
                                    <Textarea
                                        value={editedData.introduction ?? selectedMatching.introduction}
                                        onChange={(e) => handleEditChange('introduction', e.target.value)}
                                        placeholder="자기소개 (10~500자)"
                                        className="min-h-[100px]"
                                    />
                                    <Button onClick={handleSave} disabled={loading} className="mt-4 w-full">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        저장
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditMode(false)} className="w-full">취소</Button>
                                </>
                            )}
                        </div>
                    )}
                    {!editMode && (
                        <DialogClose asChild>
                            <Button variant="outline" className="mt-4 w-full">닫기</Button>
                        </DialogClose>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}