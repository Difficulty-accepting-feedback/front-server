"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, AlertCircle } from "lucide-react"; // 아이콘 추가
import GroupNavigation from "@/components/navigation/GroupNavigation";

// API 응답 타입
type RsData<T> = {
    code: string;
    message: string;
    data: T;
};

type FileMetaResponse = {
    fileId: number;
    originalName: string;
    storedName: string;
    contentType: string;
    size: number;
    path: string; // 다운로드 가능한 URL 또는 서버 상대경로
};

type PostResponse = {
    postId: number;
    boardId: number;
    memberId: number;
    title: string;
    content: string;
    createdAt: string; // ISO 문자열로 가정
    files: FileMetaResponse[];
};

export default function ShareDetailPage() {
    const BASE_URL = "http://localhost:8085";

    const params = useParams<{ postId: string }>();
    const postId = params?.postId;

    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<PostResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // TODO 세션에서 memberId 를 가져 올 수 있도록 변경
    const authMemberId = 1; // 데모용 하드코딩

    useEffect(() => {
        if (!postId) return;

        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get<RsData<PostResponse>>(
                    `${BASE_URL}/api/v1/posts/${postId}`,
                    {
                        headers: {
                            "X-Authorization-Id": authMemberId,
                        },
                    }
                );
                setPost(res.data.data);
            } catch (e: any) {
                console.error(e);
                setError(e?.response?.data?.message || "게시글을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    const createdAtText = useMemo(() => {
        if (!post?.createdAt) return "";
        try {
            return format(new Date(post.createdAt), "yyyy.MM.dd HH:mm", { locale: ko });
        } catch {
            return post.createdAt;
        }
    }, [post?.createdAt]);

    const formatBytes = (bytes: number) => {
        if (!bytes && bytes !== 0) return "";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return `${size} ${sizes[i]}`;
    };

    // 파일 다운로드
    const handleDownload = async (file: FileMetaResponse) => {
        const url =
            file.path.startsWith("http://") || file.path.startsWith("https://")
                ? file.path
                : `${BASE_URL}${file.path}`;

        try {
            const response = await axios.get(url, {
                responseType: "blob",
                headers: {
                    "X-Authorization-Id": authMemberId,
                },
            });

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = file.originalName || file.storedName || `file-${file.fileId}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (e: any) {
            console.error(e);
            alert("파일 다운로드 중 오류가 발생했습니다.");
        }
    };

    if (!postId || isNaN(Number(postId))) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <GroupNavigation className="mb-6" />
            <Card className="shadow-lg">
                {loading ? (
                    <>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-32 mb-4" />
                            <Skeleton className="h-6 w-1/4 mb-2" />
                            <div className="space-y-4">
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                            </div>
                        </CardContent>
                    </>
                ) : error ? (
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>오류</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="border-b">
                            <CardTitle className="text-2xl font-bold">{post?.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                작성자 ID: {post?.memberId} • 작성일: {createdAtText}
                            </p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-base mb-6 whitespace-pre-wrap">{post?.content}</p>
                            {/* 첨부 파일 목록 */}
                            {post?.files && post.files.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">첨부 파일</h3>
                                    <div className="space-y-4">
                                        {post.files.map((file) => (
                                            <div
                                                key={file.fileId}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">{file.originalName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {file.contentType} • {formatBytes(file.size)}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => handleDownload(file)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="ml-4"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    다운로드
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
