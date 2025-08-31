"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import GroupNavigation from "@/components/navigation/GroupNavigation";
import { STUDY_BASE_URL } from '@/lib/env';

// sonner
import { Toaster, toast } from "sonner";

// API 서버 기본 주소

// 유틸: 파일 크기 포맷터
function formatBytes(bytes: number) {
    if (bytes === 0) return "0B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))}${sizes[i]}`;
}

export default function ShareCreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 화면에는 노출하지 않음 (세션에서만 로드)
    const [boardId, setBoardId] = useState<number | null>(null);
    const [memberId, setMemberId] = useState<number | null>(null);

    // 폼 상태
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 파일 리스트를 제어하기 위해 File[]로 관리
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // TODO: 세션 스토리지에서 가져오기
        const storedBoardId = 1; // sessionStorage.getItem("boardId");
        const storedMemberId = 1; // sessionStorage.getItem("memberId");

        if (storedBoardId) {
            const num = Number(storedBoardId);
            setBoardId(Number.isFinite(num) ? num : null);
        } else {
            setBoardId(null);
        }

        if (storedMemberId) {
            const num = Number(storedMemberId);
            setMemberId(Number.isFinite(num) ? num : null);
        } else {
            setMemberId(null);
        }
    }, []);

    const handleFilesAdd = (newFiles: FileList | File[]) => {
        const incoming = Array.from(newFiles);
        // 간단한 중복 제거(이름+크기 기준)
        const combined = [...files];
        for (const f of incoming) {
            const exists = combined.some((c) => c.name === f.name && c.size === f.size);
            if (!exists) combined.push(f);
        }
        setFiles(combined);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        handleFilesAdd(e.target.files);
        // 선택 후 동일 파일 다시 선택 가능하도록 초기화
        e.target.value = "";
    };

    const handleRemoveFile = (name: string, size: number) => {
        setFiles((prev) => prev.filter((f) => !(f.name === name && f.size === size)));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesAdd(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validate = () => {
        if (!boardId) {
            toast.error("boardId 누락: 세션에서 boardId를 찾을 수 없습니다.");
            return false;
        }
        if (!memberId) {
            toast.error(
                "회원 ID 누락: 로그인 후 다시 시도하세요."
            );
            return false;
        }
        if (!title.trim()) {
            toast.error("제목은 필수입니다.");
            return false;
        }
        if (!content.trim()) {
            toast.error("내용은 필수입니다.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);

            const postPayload = {
                boardId: boardId,
                title: title,
                content: content,
            };

            const postBlob = new Blob([JSON.stringify(postPayload)], {
                type: "application/json",
            });

            const formData = new FormData();
            formData.append("post", postBlob, "post.json");

            if (files.length > 0) {
                files.forEach((file) => {
                    formData.append("files", file, file.name);
                });
            }

            const res = await fetch(`${STUDY_BASE_URL}/api/v1/posts/save`, {
                method: "POST",
                headers: {
                    "X-Authorization-Id": String(memberId),
                },
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(
                    `요청 실패(${res.status}): ${errText || "서버 오류가 발생했습니다."}`
                );
            }

            const data = await res.json();
            toast.success("게시글이 성공적으로 등록되었습니다.");

            const postId = data?.data?.postId;
            if (postId) {
                router.push(`/group/share/${postId}`);
            } else {
                router.push(`/group/share`);
            }
        } catch (error: any) {
            toast.error(error?.message ?? "요청 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const contentMax = 10_000;
    const contentCount = content.length;

    return (
        <>
            <Toaster richColors />

            {/* 상단 그룹 네비게이션 탭 추가 */}
            <GroupNavigation className="mb-6" />

            <Card className="mx-auto max-w-3xl">
                <CardHeader>
                    <CardTitle>자료 공유 글 작성</CardTitle>
                    <CardDescription>제목과 내용을 입력하고 필요한 파일을 첨부하세요.</CardDescription>
                </CardHeader>

                <Separator />

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* 제목 */}
                        <div className="space-y-2">
                            <Label htmlFor="title">제목</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                className="h-11 text-base"
                                placeholder="제목을 입력하세요"
                            />
                            <p className="text-sm text-muted-foreground">최대 100자. 핵심이 드러나는 제목을 입력하세요.</p>
                        </div>

                        {/* 내용 */}
                        <div className="space-y-2">
                            <Label htmlFor="content">내용</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={12}
                                maxLength={contentMax}
                                className="resize-y"
                                placeholder="내용을 입력하세요"
                            />
                            <div className="text-right text-sm text-muted-foreground">
                                {contentCount}/{contentMax}
                            </div>
                        </div>

                        {/* 첨부 파일 - 드롭존 + 버튼 */}
                        <div className="space-y-2">
                            <Label>첨부 파일</Label>
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={cn(
                                    "rounded-md border border-dashed p-6 text-center transition-colors",
                                    isDragging
                                        ? "border-green-500 bg-green-50"
                                        : "border-muted-foreground/30"
                                )}
                            >
                                <p className="mb-2">파일을 여기로 드래그 앤 드롭하거나,</p>
                                <p className="mb-4">아래 버튼을 눌러 파일을 선택하세요.</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    파일 선택
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileInputChange}
                                />
                            </div>
                        </div>

                        {/* 파일 목록 */}
                        {files.length > 0 && (
                            <div className="space-y-2">
                                <Label>선택된 파일</Label>
                                <ul className="space-y-2">
                                    {files.map((f) => (
                                        <li
                                            key={`${f.name}-${f.size}`}
                                            className="flex items-center justify-between rounded-md border p-2"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="truncate">{f.name}</span>
                                                <span className="shrink-0 text-sm text-muted-foreground">
                          {formatBytes(f.size)}
                        </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(f.name, f.size)}
                                            >
                                                제거
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>

                    <Separator />

                    <CardFooter className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setTitle("");
                                setContent("");
                                setFiles([]);
                            }}
                            disabled={loading}
                        >
                            초기화
                        </Button>

                        <Button type="submit" disabled={loading}>
                            {loading ? "작성 중..." : "작성하기"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </>
    );
}