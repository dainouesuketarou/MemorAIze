'use client';

import { AlertCircle, Brain, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiGenerationLimit } from '@/hooks/use-ai-generation-limit';
import { Card, CardContent } from '../ui/card';

/**
 * ヘッダー用のコンパクト表示
 * 残り 10 % 未満で文字色を赤系に
 */
export function AiLimitBadge({ className }: { className?: string }) {
  const { limit, loading } = useAiGenerationLimit();

  if (loading) {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
            <div
                className={cn(
          'flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md',
          className,
        )}
      >
        <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm font-medium">読み込み中...</span>
      </div>
            </CardContent>
        </Card>
    );
  }

  if (!limit) return null;

  return (
    <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">
                今月のAI生成回数: {limit.count}/{limit.limit}回
              </p>
              <p className="text-sm text-muted-foreground">
                残り{limit.limit - limit.count}回生成できます
              </p>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
