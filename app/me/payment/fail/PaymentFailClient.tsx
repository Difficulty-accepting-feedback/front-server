'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailClient({
                                              code,
                                              message,
                                              orderId,
                                          }: {
    code?: string;
    message?: string;
    orderId?: string;
}) {
    const router = useRouter();

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-white/80 dark:bg-gray-800/70">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <XCircle className="h-6 w-6" />
                        결제에 실패했어요
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                        주문번호: <b>{orderId ?? '-'}</b>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        사유: <b>{message ?? '알 수 없는 오류'}</b>
                    </div>
                    <div className="text-xs text-muted-foreground">코드: {code ?? '-'}</div>
                    <div className="pt-2 flex gap-2">
                        <Button onClick={() => router.push('/me/payment')} className="bg-emerald-600 hover:bg-emerald-700">
                            다시 시도
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/')}>
                            홈으로
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}