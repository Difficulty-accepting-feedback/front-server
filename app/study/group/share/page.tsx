'use client';

import { useState, useEffect } from 'react';
import { RsData, PostSimpleResponse } from '@/lib/post-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GroupNavigation from "@/components/navigation/GroupNavigation";
import { STUDY_BASE_URL } from '@/lib/env';

export default function PostListPage() {
    const [posts, setPosts] = useState<PostSimpleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const BOARD_ID = 1;

    useEffect(() => {
        async function fetchPosts() {
            try {
                const res = await fetch(`${STUDY_BASE_URL}/api/v1/posts/list?boardId=${BOARD_ID}`, {
                    method: 'GET',
                    headers: {
                        'X-Authorization-Id': `12`,
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'include',
                    cache: 'force-cache', // 캐싱 활성화로 반복 호출 방지
                });

                if (!res.ok) {
                    throw new Error('글 목록을 불러오는 데 실패했습니다.');
                }

                const rsData: RsData<PostSimpleResponse[]> = await res.json(); // RsData 타입 지정
                // RsData 구조 반영: code, message, data (data는 PostSimpleResponse 배열)
                if (rsData.code !== '200') {
                    throw new Error(rsData.message || 'API 응답 오류');
                }

                setPosts(rsData.data || []); // PostSimpleResponse 배열 설정
                setLoading(false);
            } catch (err) {
                setError((err as Error).message);
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    if (loading) return <p className="text-center mt-10 text-lg">로딩 중...</p>;
    if (error) return <p className="text-center mt-10 text-red-500 text-lg">에러: {error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-background">
            <GroupNavigation className="mb-6" />
            {posts.length === 0 ? (
                <p className="text-center text-muted-foreground">포스트가 없습니다.</p>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <Card key={post.postId} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>작성자: {post.memberId}</span>
                                    <span>{post.createdAt.substring(0, 10)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}