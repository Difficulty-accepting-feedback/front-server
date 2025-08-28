'use client';

import {useState, useEffect} from 'react';
import {getGroups, GroupResponse, Category, SkillTagLabel, PersonalityTagLabel} from '@/lib/hobby-api';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Search, User, BookOpen} from 'lucide-react';
import { useRouter } from 'next/navigation';

const mockMentorImage = '/images/mentor_default.png';

export default function StudyPage() {
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const router = useRouter();

    useEffect(() => {
        async function fetchGroupsData() {
            try {
                const data = await getGroups(Category.STUDY);
                setGroups(data);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message);
                setLoading(false);
            }
        }

        fetchGroupsData();
    }, []);

    // 검색어에 따라 필터링
    const filteredGroups = searchText
        ? groups.filter(g => g.groupName.includes(searchText) || g.description.includes(searchText))
        : groups;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* 상단 홍보 영역 - 가로 폭 확장 */}
                <div
                    className="text-center mb-12 bg-gradient-to-r from-emerald-100 via-teal-100 to-sky-100 text-gray-800 py-16 px-8 rounded-3xl shadow-xl"
                >
                    <h1 className="text-4xl md:text-4xl font-bold mb-6 leading-tight text-gray-800">
                        같은 관심사로 연결된 특별한 인연들과 만나
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600">
                        함께 더 즐거운 경험을 향해 나아가세요!
                        <span className="ml-1 font-semibold text-gray-900"> 새로운 재미와 소중한 추억을 만들어가요. </span>
                    </p>

                    <br/>

                    {/* 검색창 영역 - 가로 폭 확장 */}
                    <div className="relative max-w-4xl mx-auto mb-8">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-6 h-6"/>
                        <Input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="제목, 내용, 직무명, 멘토명으로 검색해 보세요"
                            className="w-full pl-12 pr-4 py-4 text-lg rounded-full shadow-lg border-0 focus:ring-4 focus:ring-green-300 bg-white"
                            aria-label="그룹 검색"
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-center gap-4 mb-8">
                        <Button
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105">
                            <User className="w-5 h-5 mr-2"/>
                            멘토 지원
                        </Button>
                        <Button variant="outline"
                                className="border-green-300 text-green-600 hover:bg-green-50 px-8 py-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105">
                            <BookOpen className="w-5 h-5 mr-2"/>
                            멘토링 후기
                        </Button>
                    </div>

                </div>

                {/* 필터 및 정렬 영역 */}
                <div className="flex justify-end mb-6">
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-32 border-green-200 focus:ring-green-300">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">기본순</SelectItem>
                            <SelectItem value="popular">인기순</SelectItem>
                            <SelectItem value="recent">최신순</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 카드 리스트 - 그리드 컬럼 수 증가 및 가로 폭 확장 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-green-600">
                            로딩 중...
                        </div>
                    ) : error ? (
                        <div className="col-span-full text-center py-12 text-red-500">
                            에러: {error}
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-green-600">
                            그룹이 없습니다.
                        </div>
                    ) : (
                        <>
                            {filteredGroups.map((group) => (
                                <Card
                                    onClick={() => router.push(`/mentoring/${group.groupId}`)}
                                    role="link"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') router.push(`/groups/${group.groupId}`);
                                    }}
                                    className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-102 border-green-100 hover:border-green-300"
                                >
                                    <CardHeader className="p-0">
                                        <div
                                            className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                            <img
                                                src={mockMentorImage}
                                                alt="멘토"
                                                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <CardTitle className="text-lg font-bold mb-3 text-gray-800">
                                            {group.groupName}
                                        </CardTitle>
                                        <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                                            {group.description}
                                        </p>
                                        <p className="text-gray-700 font-medium mb-3">
                                            멘토명 or 직무명
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        {SkillTagLabel[group.skillTag]}
                      </span>
                                            <span
                                                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        {PersonalityTagLabel[group.personalityTag]}
                      </span>
                                            <span
                                                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        #멘토링
                      </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                      <span className="text-green-800 font-bold text-lg">
                        {group.amount} 원
                      </span>
                                            <span className="text-green-600 text-sm">
                        [6주]
                      </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* 안내 카드 */}
                            <Card
                                className="border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 transition-all duration-200">
                                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                                    <div
                                        className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <User className="w-8 h-8 text-white"/>
                                    </div>
                                    <h3 className="text-lg font-bold mb-3 text-green-800">
                                        누구나 멘토가 될 수 있어요.
                                    </h3>
                                    <p className="text-green-600 mb-6 text-sm leading-relaxed">
                                        지식과 경험을 나누고, 의미 있는 인사이트를 전해 주세요!
                                    </p>
                                    <Button
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-full shadow-md transition-all duration-200 transform hover:scale-105">
                                        멘토 지원하기
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}