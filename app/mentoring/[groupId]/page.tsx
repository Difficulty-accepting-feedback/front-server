'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGroupDetail, GroupDetailResponse, PersonalityTagLabel, SkillTagLabel } from '@/lib/study-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Eye, DollarSign, BookOpen, Star, Calendar, MapPin } from 'lucide-react';

export default function StudyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params?.groupId as string;

    const [groupDetail, setGroupDetail] = useState<GroupDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId || isNaN(Number(groupId))) {
            setError('유효하지 않은 그룹 ID입니다.');
            setLoading(false);
            return;
        }

        const fetchGroupDetail = async () => {
            try {
                setLoading(true);
                const data = await getGroupDetail(Number(groupId));
                setGroupDetail(data);
                setError(null);
            } catch (err) {
                setError((err as Error).message);
                setGroupDetail(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetail();
    }, [groupId]);

    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center space-y-4">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-500"></div>
                        <p className="text-gray-600 font-medium">그룹 정보를 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-8 h-8 text-red-500">⚠️</div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">오류가 발생했습니다</h3>
                        <p className="text-gray-600">{error}</p>
                        <Button
                            onClick={() => router.back()}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            돌아가기
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!groupDetail) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="w-8 h-8 text-gray-400"/>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">그룹을 찾을 수 없습니다</h3>
                        <p className="text-gray-600">요청하신 그룹이 존재하지 않거나 삭제되었습니다.</p>
                        <Button
                            onClick={() => router.back()}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            돌아가기
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 브레드크럼 네비게이션 */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center text-sm text-gray-500">
                        <button
                            onClick={() => router.back()}
                            className="hover:text-gray-700 transition-colors"
                        >
                            멘토링
                        </button>
                        <span className="mx-2">/</span>
                        <span>개발 · 프로그래밍, 커리어 · 자기계발</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* 메인 타이틀 섹션 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {groupDetail.groupName}
                    </h1>
                    <div className="flex items-center text-green-600 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm">멘토와 함께 안사이트를 나눠보세요. 더 맑힌, 더 맑힌 길 수 있어요!</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full border border-blue-200">
            {SkillTagLabel[groupDetail.skillTag] ?? groupDetail.skillTag}
          </span>
                        <span
                            className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full border border-purple-200">
            {PersonalityTagLabel[groupDetail.personalityTag] ?? groupDetail.personalityTag}
          </span>
                        <span
                            className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-200">
            {groupDetail.category}
          </span>
                    </div>
                </div>

                {/* 메인 컨텐츠 영역 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 왼쪽 메인 컨텐츠 */}
                    <div className="lg:col-span-2">
                        {/* 탭 네비게이션 */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    className="border-b-2 border-gray-900 py-2 px-1 text-sm font-medium text-gray-900">
                                    멘토링 소개
                                </button>
                                <button
                                    className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                                    멘토 정보
                                </button>
                                <button
                                    className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                                    멘토링 리뷰
                                </button>
                            </nav>
                        </div>

                        {/* 소개 섹션 */}
                        <div className="mb-8">
                            <p className="text-gray-700 leading-relaxed mb-6">
                                {groupDetail.description}
                            </p>
                        </div>

                        {/* 주요 경력 섹션 */}
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-orange-600 text-sm">👨‍💼</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">주요 경력</h3>
                            </div>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <span
                                        className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    전문가와 함께하는 체계적인 학습
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    동료들과의 네트워킹 기회
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    개인 맞춤형 피드백 제공
                                </li>
                                <li className="flex items-start">
                                    <span
                                        className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    학습 자료 및 리소스 공유
                                </li>
                            </ul>
                        </div>

                        {/* 체용 전문성 섹션 */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-red-600 text-sm">🎯</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">체용 전문성</h3>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 프로필 카드 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                            {/* 프로필 헤더 */}
                            <div className="text-center mb-6">
                                <div
                                    className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-gray-400"/>
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                    {groupDetail.groupName}
                                </h3>
                                <div className="flex flex-wrap gap-1 justify-center mb-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200">
                  SW 엔지니어
                </span>
                                    <span
                                        className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded border border-orange-200">
                  Lead 레벨
                </span>
                                    <span
                                        className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded border border-green-200">
                  네카라쿠배
                </span>
                                </div>
                            </div>

                            {/* 가격 정보 */}
                            <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                    ₩{groupDetail.amount.toLocaleString()}
                                </div>
                                <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                                    <Calendar className="w-4 h-4 mr-1"/>
                                    <span>30분</span>
                                </div>
                                <div className="flex items-center justify-center text-sm text-gray-500">
                                    <Users className="w-4 h-4 mr-1"/>
                                    <span>{groupDetail.memberCount}회 최대 1인</span>
                                </div>
                            </div>

                            {/* 신청 버튼 */}
                            <Button
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors mb-4">
                                멘토링 신청하기
                            </Button>

                            {/* 통계 정보 */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <div className="flex items-center">
                                        <Eye className="w-4 h-4 mr-1"/>
                                        <span>조회 수</span>
                                    </div>
                                    <span className="font-medium">{groupDetail.viewCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1"/>
                                        <span>멤버 수</span>
                                    </div>
                                    <span className="font-medium">{groupDetail.memberCount}명</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}