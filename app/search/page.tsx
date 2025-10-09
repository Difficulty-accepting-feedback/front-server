'use client';

import { useState, useEffect } from 'react';
import {
    getGroupSuggestions,
    searchGroups,
    Category,
    SkillTag,
    PersonalityTagLabel,
    SkillTagLabel,
    GroupDocument
} from '@/lib/study-api';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [results, setResults] = useState<GroupDocument[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
    const [selectedSkill, setSelectedSkill] = useState<SkillTag | ''>('');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // 자동 완성 제안 불러오기
    useEffect(() => {
        if (query.length > 0) {
            const fetchSuggestions = async () => {
                try {
                    const data = await getGroupSuggestions(query);
                    // API 응답이 문자열 배열이라고 가정 (실제 응답에 맞게 조정)
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('제안 불러오기 실패:', error);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query]);

    // 검색 실행
    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const params = {
                query: query.trim(),
                category: selectedCategory || undefined,
                skillTag: selectedSkill || undefined,
                sortBy: 'startAt' as const,
                sortOrder: 'desc' as const,
                page: 1, // API 파라미터에 맞게 조정 (1-based)
                size: 10,
            };
            const data = await searchGroups(params); // GroupDocument[] 반환
            setResults(data);
        } catch (error) {
            console.error('검색 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 제안 클릭 시 쿼리 업데이트
    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        handleSearch(); // 자동 검색
    };

    // 카테고리 옵션 (Category enum 기반)
    const categoryOptions = [
        { value: '', label: '모든 카테고리' },
        { value: Category.STUDY, label: '스터디' },
        { value: Category.HOBBY, label: '취미' },
        { value: Category.MENTORING, label: '멘토링' },
    ];

    // 스킬 태그 옵션 (SkillTag enum 일부 예시, 전체는 길어 select로 제한하거나 검색으로 구현 추천)
    const skillOptions = [
        { value: '', label: '모든 스킬' },
        { value: SkillTag.JAVA_PROGRAMMING, label: SkillTagLabel[SkillTag.JAVA_PROGRAMMING] },
        { value: SkillTag.WEB_DEVELOPMENT, label: SkillTagLabel[SkillTag.WEB_DEVELOPMENT] },
        // ... 필요에 따라 더 추가
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">그룹 검색</h1>

                {/* 검색 바 */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="그룹 이름이나 키워드로 검색하세요..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 필터 */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as Category)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value as SkillTag)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {skillOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? '검색 중...' : '검색'}
                    </button>
                </div>

                {/* 검색 결과 */}
                {results && results.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-gray-600">총 {results.length}개 결과</p> {/* 배열 길이로 총 개수 표시 */}
                        {results.map((group) => (
                            <div key={group.id} className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold">{group.name}</h3>
                                <p className="text-gray-600 mt-1">{group.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">카테고리: {group.category}</span>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">인원: {group.amount}명</span>
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    스킬: {SkillTagLabel[group.skillTag as SkillTag] || group.skillTag}
                  </span>
                                    {group.personalityTag && (
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      성격: {PersonalityTagLabel[group.personalityTag]}
                    </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">시작: {new Date(group.startAt).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-500">조회수: {group.viewCount}</p>
                            </div>
                        ))}
                    </div>
                )}
                {results && results.length === 0 && (
                    <p className="text-gray-500 text-center">검색 결과가 없습니다.</p>
                )}
            </div>
        </div>
    );
}