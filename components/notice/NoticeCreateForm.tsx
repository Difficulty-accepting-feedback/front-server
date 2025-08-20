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

// ===== 3) 컴포넌트 Props 타입 =====
interface NoticeCreateFormProps {
    groupId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

// ===== 4) 컴포넌트 =====
export default function NoticeCreateForm({
                                             groupId,
                                             onSuccess,
                                             onCancel
                                         }: NoticeCreateFormProps) {
    const formId = useId();

    const form = useForm<FormInput, any, FormOutput>({
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
        try {
            await createMutation.mutateAsync(values);

            // 폼 리셋
            form.reset({
                groupId,
                content: '',
                isPinned: false
            });

            // 성공 콜백 실행
            onSuccess?.();
        } catch (error) {
            // 에러는 createMutation.isError로 처리됨
            console.error('공지사항 생성 실패:', error);
        }
    };

    // 취소 처리
    const handleCancel = () => {
        form.reset({
            groupId,
            content: '',
            isPinned: false,
        });
        onCancel?.();
    };

    // 내용 지우기
    const handleClearContent = () => {
        form.setValue('content', '');
        form.setFocus('content');
    };

    const isSubmitting = createMutation.isPending;
    const hasError = createMutation.isError;
    const isSuccess = createMutation.isSuccess;

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                    <Sparkles size={12} />
                    <span>공지 생성</span>
                </Badge>
                <div>
                    <h3 className="text-lg font-medium">그룹 공지 작성</h3>
                    <p className="text-sm text-gray-600">
                        명확하고 간결한 공지를 작성해 보세요.
                    </p>
                </div>
            </div>

            {/* 에러 메시지 */}
            {hasError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 text-sm">
                        공지사항 생성에 실패했습니다. 다시 시도해주세요.
                    </p>
                </div>
            )}

            {/* 폼 */}
            <Form {...form}>
                <form
                    id={formId}
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* content 필드 */}
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    공지 내용
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Textarea
                                            {...field}
                                            placeholder="핵심 정보는 첫 문장에 배치하세요."
                                            className="min-h-[120px] resize-none"
                                            disabled={isSubmitting}
                                        />
                                        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                                            {field.value?.length ?? 0}/500
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* isPinned 필드 */}
                    <FormField
                        control={form.control}
                        name="isPinned"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-sm font-medium">
                                        상단 고정
                                    </FormLabel>
                                    <div className="text-sm text-gray-600">
                                        체크 시 목록 최상단 노출
                                    </div>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* 버튼 그룹 */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center space-x-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClearContent}
                                disabled={isSubmitting || !form.getValues('content')}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                내용 지우기
                            </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    취소
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !form.formState.isValid}
                            >
                                {isSubmitting ? '저장 중...' : '공지 생성'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}