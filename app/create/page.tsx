'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Video, Sparkles } from 'lucide-react';

export default function CreateRoomPage() {
    const router = useRouter();
    const [room, setRoom] = useState('');
    const [loading, setLoading] = useState(false);

    // 간단한 방 제목 추천(가독성 + URL-safe)
    const suggestion = useMemo(() => {
        const adjectives = ['bright', 'calm', 'fresh', 'mint', 'cool', 'leaf', 'soft', 'lime'];
        const nouns = ['meeting', 'study', 'talk', 'session', 'gather', 'sync', 'room', 'space'];
        const a = adjectives[Math.floor(Math.random() * adjectives.length)];
        const n = nouns[Math.floor(Math.random() * nouns.length)];
        return `${a}-${n}-${Math.floor(Math.random() * 900 + 100)}`; // 예: fresh-room-742
    }, []);

    useEffect(() => {
        // 초기 진입 시 추천값을 placeholder로 노출
        // 필요하면 setRoom(suggestion)으로 기본값 지정도 가능
    }, [suggestion]);

    const joinWithRoom = (value: string) => {
        const name = value.trim();
        if (!name) return;
        setLoading(true);
        const safeRoom = encodeURIComponent(name);
        router.push(`/meeting/${safeRoom}`);
    };

    const handleJoin = () => joinWithRoom(room);

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            joinWithRoom((e.target as HTMLInputElement).value);
        }
    };

    const useSuggestion = () => setRoom(suggestion);

    return (
        <div className="flex min-h-screen items-center justify-center bg-green-50 p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-3">
                    <div className="flex items-center justify-center">
                        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                            <Video size={16} />
                            화상 회의
                        </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold">회의 방 만들기</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        새로운 회의 방 이름을 입력하거나 추천 이름을 사용하세요.
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="room">방 이름</Label>
                        <Input
                            id="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={suggestion}
                            className="h-11"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="h-11 w-1/2"
                            onClick={useSuggestion}
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            추천 이름 사용
                        </Button>
                        <Button
                            onClick={handleJoin}
                            className="h-11 w-1/2 text-white font-semibold"
                            disabled={!room.trim() || loading}
                        >
                            {loading ? '입장 중…' : '입장하기'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}