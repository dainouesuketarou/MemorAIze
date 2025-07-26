import { LoaderCircle } from 'lucide-react';

export function GeneratingCards() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">暗記カードを生成中...</h3>
        <p className="text-sm text-muted-foreground">
          AIが入力された内容を分析し、最適な暗記カードを作成しています。
          <br />
          しばらくお待ちください。
        </p>
      </div>
    </div>
  );
} 