'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, Bell, Share2, Video, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// 자료 더미 데이터 예시
const dummyFiles = [
    { id: 1, title: 'React 입문 자료.pdf', description: '스터디용 React 개론서', uploader: '홍길동', date: '2025-08-10' },
    { id: 2, title: 'UI 디자인 가이드.docx', description: '디자인 규칙 및 레이아웃 구성안', uploader: '김디자', date: '2025-08-11' },
];

type Props = {
    params: { groupId: string };
};

export default function SharePage({ params }: Props) {
    const groupId = Number(params.groupId);
    const pathname = usePathname();
    const [showForm, setShowForm] = useState(false);
    const [files, setFiles] = useState(dummyFiles);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    const navItems = [
        { name: '대시보드', href: `/group/dashboard/${groupId}`, icon: <LayoutGrid className="h-4 w-4" /> },
        { name: '공지사항', href: `/group/notice/${groupId}`, icon: <Bell className="h-4 w-4" /> },
        { name: '자료 공유', href: `/group/share/${groupId}`, icon: <Share2 className="h-4 w-4" /> },
        { name: '화상 미팅', href: `/meeting/${groupId}`, icon: <Video className="h-4 w-4" /> },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        const newFile = { id: Date.now(), title, description: desc, uploader: '나', date: new Date().toISOString().slice(0, 10) };
        setFiles([newFile, ...files]);
        setTitle('');
        setDesc('');
        setShowForm(false);
    };

    return (
        <div className="flex max-w-7xl mx-auto px-6 py-6 gap-8">
            {/* 📌 왼쪽 사이드바 */}
            <aside className="w-56 flex-shrink-0">
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors 
                  ${active
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-700'}`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* 📄 메인 영역 */}
            <div className="flex-1 space-y-8">
                {/* 자료 목록 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">자료 공유 게시판</h2>
                        <Button onClick={() => setShowForm((prev) => !prev)} className="bg-emerald-700 hover:bg-emerald-800">
                            {showForm ? '폼 닫기' : <><Upload className="mr-1 h-4 w-4" /> 자료 업로드</>}
                        </Button>
                    </div>

                    {files.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">등록된 자료가 없습니다.</div>
                    ) : (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left">제목</th>
                                    <th className="px-4 py-2 text-left">설명</th>
                                    <th className="px-4 py-2">업로더</th>
                                    <th className="px-4 py-2">등록일</th>
                                </tr>
                                </thead>
                                <tbody>
                                {files.map((file) => (
                                    <tr key={file.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-emerald-600" /> {file.title}
                                        </td>
                                        <td className="px-4 py-2">{file.description}</td>
                                        <td className="px-4 py-2 text-center">{file.uploader}</td>
                                        <td className="px-4 py-2 text-center">{file.date}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* 자료 업로드 폼 */}
                {showForm && (
                    <section className="border-t pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">자료 제목</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="파일 제목" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">설명</label>
                                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="자료에 대한 간단한 설명" />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800">업로드</Button>
                                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>취소</Button>
                            </div>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
}
