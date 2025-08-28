'use client';

import { useState, useEffect } from 'react';
import { getGroups, GroupResponse, Category } from '@/lib/group-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HobbyPage() {
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHobbyGroups() {
            try {
                const data = await getGroups(Category.HOBBY);
                setGroups(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchHobbyGroups();
    }, []);

    if (loading) return <p className="text-center mt-10">로딩 중...</p>;
    if (error)   return <p className="text-center mt-10 text-red-500">에러: {error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">HOBBY 그룹 목록</h1>
            {groups.length === 0 ? (
                <p className="text-center text-muted-foreground">그룹이 없습니다.</p>
            ) : (
                <div className="space-y-4">
                    {groups.map(g => (
                        <Card key={g.groupId} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{g.groupName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{g.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
