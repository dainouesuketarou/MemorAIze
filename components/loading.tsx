import { LoaderCircle } from 'lucide-react';

export function Loading() {
  return (
    <div className="w-full text-center py-20">
      <div className="flex flex-col items-center justify-center space-y-4">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
} 