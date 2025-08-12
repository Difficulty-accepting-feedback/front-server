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
            <div className="flex min-h-screen items-center justify-center bg-green-50 p-6">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center space-y-3">
                        <Badge variant="secondary" className="mx-auto flex items-center gap-2 px-3 py-1">
                            <Users size={16} />
                            회의 참가
                        </Badge>
                        <CardTitle className="text-2xl font-bold">회의 방: {decodedRoomName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            채팅과 참가자 목록에 표시될 이름을 입력하세요.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="닉네임 입력"
                            className="h-11"
                            autoFocus
                        />
                        <Button
                            disabled={!name.trim()}
                            onClick={() => setJoined(true)}
                            className="w-full h-11 text-white font-semibold"
                        >
                            회의 참가하기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 회의 UI
    // @ts-ignore
    return (
        <div className="p-6 space-y-4 bg-green-50 min-h-screen">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                    <Video size={18} className="text-green-700" />
                    <span className="font-semibold text-green-800">
            {decodedRoomName}
          </span>
                </div>
                <Badge variant="secondary">{name}</Badge>
            </div>

            <div className="w-full rounded-md border border-gray-200 overflow-hidden bg-white shadow">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={decodedRoomName}
                    userInfo={{ displayName: name }}
                    configOverwrite={{
                        startWithAudioMuted: true,
                        prejoinConfig: { enabled: false },
                    }}
                    interfaceConfigOverwrite={{
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'raisehand', 'chat', 'tileview', 'hangup',
                            'settings', 'videoquality',
                        ],
                    }}
                    getIFrameRef={(node) => {
                        if (node) node.style.height = '720px';
                    }}
                />
            </div>
        </div>
    );
}
