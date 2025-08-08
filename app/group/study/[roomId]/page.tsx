"use client"

import {useParams} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {Client} from '@stomp/stompjs';
import {Badge, Camera, Music} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

export default function VideoRoom() {
    const params = useParams();
    const roomId = params.roomId as string; // roomId를 params에서 가져옴

    const [client, setClient] = useState<Client | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const DEV_BASE_URL = "localhost:8080"

    // STOMP 클라이언트 초기화 및 연결
    useEffect(() => {
        if (!roomId) return;

        const stompClient = new Client({
            brokerURL: `ws://${DEV_BASE_URL}/signaling`, // 서버의 WebSocket 엔드포인트
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {roomId : roomId},
            onConnect: () => {
                console.log('STOMP 연결 성공');
                // 방의 토픽 구독 (서버로부터 Offer/Answer/Candidate 수신)
                stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
                    const data = JSON.parse(message.body);
                    handleSignalingData(data, stompClient);
                });
                // 연결 후 Offer 생성 및 전송 (호스트인 경우)
                startWebRTC(stompClient);
            },
            onStompError: (frame) => {
                console.error('STOMP 에러:', frame);
            },
        });
        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, [roomId]);

    // WebRTC 시작: 미디어 스트림 가져오고 PeerConnection 생성
    const startWebRTC = async (stompClient: Client) => {  // stompClient를 받음
        console.log('startWebRTC 호출됨 - stompClient 확인:', stompClient ? '존재' : '없음');

        try {
            console.log('미디어 스트림 획득 시도');
            localStreamRef.current = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            console.log('미디어 스트림 획득 성공:', localStreamRef.current.getTracks().length, '개의 트랙');
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
                console.log('로컬 비디오 요소에 스트림 할당 완료');
            }

            console.log('RTCPeerConnection 생성 시도');
            peerConnectionRef.current = new RTCPeerConnection({
                iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
            });
            console.log('RTCPeerConnection 생성 성공');

            console.log('로컬 스트림 트랙 추가 시작');
            localStreamRef.current.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
                console.log('트랙 추가:', track.kind);  // audio/video 구분 로그
            });
            console.log('모든 트랙 추가 완료');

            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate && client) {
                    console.log('ICE candidate 생성 및 전송:', event.candidate.candidate);
                    client.publish({
                        destination: `/app/room/${roomId}`,
                        body: JSON.stringify({type: 'candidate', candidate: event.candidate}),
                    });
                }
            };

            peerConnectionRef.current.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    console.log('원격 스트림 수신 및 비디오 할당 완료:', event.streams[0].getTracks().length, '개의 트랙');
                }
            };

            console.log('Offer 생성 시도');
            const offer = await peerConnectionRef.current.createOffer();
            console.log('Offer 생성 성공:', offer.type);
            console.log('Offer 생성 성공:', offer);

            console.log('LocalDescription 설정 시도');
            await peerConnectionRef.current.setLocalDescription(offer);
            console.log('LocalDescription 설정 성공');

            if (stompClient && stompClient.connected) {
                console.log('Offer 전송 시도: /app/room/${roomId}');
                stompClient.publish({
                    destination: `/app/room/${roomId}`,
                    body: JSON.stringify({type: 'offer', offer}),
                });
                console.log('Offer 전송 완료');
            } else {
                console.error('stompClient가 없거나 연결되지 않았습니다.');
            }
        } catch (error) {
            console.error('WebRTC 시작 에러:', error);
        }
    };

    // 서버로부터 수신한 signaling 데이터 처리
    const handleSignalingData = async (data: any, stompClient: Client) => {  // stompClient 인자 추가
        console.log('handleSignalingData 호출됨 - 수신 데이터 타입:', data.type);

        if (!peerConnectionRef.current || !stompClient) {
            console.error('peerConnection 또는 stompClient가 없음 - 처리 스킵');
            return;
        }

        try {
            if (data.type === 'offer') {
                console.log('Offer 처리 시작 - offer SDP 길이:', data.offer.sdp?.length || '없음');
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                console.log('setRemoteDescription(Offer) 완료');

                console.log('Answer 생성 시도');
                const answer = await peerConnectionRef.current.createAnswer();
                console.log('Answer 생성 성공 - answer SDP 길이:', answer.sdp?.length || '없음');

                console.log('setLocalDescription(Answer) 시도');
                await peerConnectionRef.current.setLocalDescription(answer);
                console.log('setLocalDescription(Answer) 완료');

                if (stompClient.connected) {
                    console.log('Answer 전송 시도: /app/room/${roomId}');
                    stompClient.publish({
                        destination: `/app/room/${roomId}`,
                        body: JSON.stringify({type: 'answer', answer}),
                    });
                    console.log('Answer 전송 완료');
                } else {
                    console.error('stompClient가 연결되지 않음 - 전송 스킵');
                }
            } else if (data.type === 'answer') {
                console.log('Answer 처리 시작 - answer SDP 길이:', data.answer.sdp?.length || '없음');
                // 상태 체크 추가: stable 상태면 스킵
                if (peerConnectionRef.current.signalingState === 'stable') {
                    console.warn('이미 stable 상태 - answer 설정 스킵');
                    return;
                }
                // remoteDescription이 이미 있으면 스킵 (중복 방지)
                if (peerConnectionRef.current.remoteDescription) {
                    console.warn('이미 remoteDescription 설정됨 - 중복 answer 무시');
                    return;
                }
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                console.log('setRemoteDescription(Answer) 완료');
            } else if (data.type === 'candidate') {
                console.log('ICE Candidate 처리 시작 - candidate:', data.candidate.candidate?.substring(0, 50) + '...');
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log('addIceCandidate 완료');
            } else {
                console.warn('알 수 없는 데이터 타입:', data.type);
            }
        } catch (error) {
            console.error("signaling 데이터 처리 오류 발생");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Camera className="h-6 w-6 text-blue-500" />
                        화상 회의 방: {roomId}
                    </CardTitle>
                    <Badge variant="secondary" className="text-sm">
                        참가자: 2명
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="relative">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full rounded-lg shadow-md bg-black"
                            />
                            <Badge className="absolute bottom-2 left-2 bg-blue-500">
                                내 비디오
                            </Badge>
                        </div>
                        <div className="relative">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full rounded-lg shadow-md bg-black"
                            />
                            <Badge className="absolute bottom-2 left-2 bg-green-500">
                                상대 비디오
                            </Badge>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" size="icon" aria-label="음소거">
                            <Music className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" aria-label="카메라 끄기">
                            <Camera className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                            방 나가기
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
