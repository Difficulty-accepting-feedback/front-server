'use client';

import { z } from 'zod';
import { useId } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateNotice } from '@/hooks/useNotice';

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

// ===== 1) Zod 스키마 정의 =====
const schema = z.object({
    groupId: z.coerce.number().int().min(1),
    content: z
        .string()
        .min(10, '공지 내용은 최소 10자 이상 입력해주세요.')
        .max(500, '공지 내용은 최대 500자까지 입력 가능합니다.'),
    isPinned: z.boolean().default(false),
});

// ===== 2) 타입 분리 =====
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

// ===== 3) 컴포넌트 =====
export default function NoticeCreateForm({ groupId }: { groupId: number }) {
    const formId = useId();

    const form = useForm<FormInput, unknown, FormOutput>({
        resolver: zodResolver(schema),
        defaultValues: {
            groupId, // parameter로 받은 값
            content: '',
            isPinned: false,
        },
        mode: 'onChange',
    });

    const createMutation = useCreateNotice();

    const onSubmit: SubmitHandler<FormOutput> = async (values) => {
        await createMutation.mutateAsync(values);
        form.reset({ ...values, content: '', groupId });
    };

    const isSubmitting = createMutation.isPending;
    const hasError = createMutation.isError;
    const isSuccess = createMutation.isSuccess;

    return (
        <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white">공지 생성</Badge>
                    <h3 className="text-lg font-semibold text-gray-900">그룹 공지 작성</h3>
                </div>
                <p className="text-sm text-gray-500">명확하고 간결한 공지를 작성해 보세요.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
                    <input type="hidden" {...form.register('groupId')} value={groupId} />

                    {/* content */}
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel className="text-gray-800">공지 내용</FormLabel>
                                <FormControl>
                                    <Textarea rows={6} maxLength={500} placeholder="공지 내용 (10~500자)" {...field} />
                                </FormControl>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>핵심 정보는 첫 문장에 배치하세요.</span>
                                    <span>{field.value?.length ?? 0}/500</span>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* isPinned */}
                    <FormField
                        control={form.control}
                        name="isPinned"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                <div className="grid">
                                    <FormLabel className="text-gray-800">상단 고정</FormLabel>
                                    <p className="text-xs text-gray-500">체크 시 목록 최상단 노출</p>
                                </div>
                                <FormControl>
                                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={isSubmitting} className="h-11 bg-emerald-700 hover:bg-emerald-800">
                            {isSubmitting ? '저장 중...' : '공지 생성'}
                        </Button>
                        <button
                            type="button"
                            onClick={() => form.reset({ ...form.getValues(), content: '' })}
                            className="text-sm text-gray-600 hover:underline"
                        >
                            내용 지우기
                        </button>
                    </div>
                </form>
            </Form>
        </section>

    );
}
