'use client';

import { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Video } from 'lucide-react';

export default function MeetingPage({ params }: { params: { roomName: string } }) {
    const decodedRoomName = decodeURIComponent(params.roomName);
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);

    if (!joined) {
        // 닉네임 입력 UI
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">회의 참여</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Video className="h-5 w-5 text-blue-500" />
                                <Badge variant="secondary">방 이름: {decodedRoomName}</Badge>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    채팅과 참가자 목록에 표시될 이름을 입력하세요.
                                </label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름 입력"
                                    required
                                />
                            </div>
                            <Button
                                onClick={() => setJoined(true)}
                                disabled={!name}
                                className="w-full"
                            >
                                <Users className="mr-2 h-4 w-4" /> 회의 참여
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Jitsi 회의 UI
    return (
        <div className="w-full h-screen">
            <JitsiMeeting
                roomName={decodedRoomName}
                userInfo={{ displayName: name, email: '' }}
                interfaceConfigOverwrite={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#000',
                }}
                getIFrameRef={(node) => {
                    node.style.height = '100%';
                    node.style.width = '100%';
                }}
            />
        </div>
    );
}
