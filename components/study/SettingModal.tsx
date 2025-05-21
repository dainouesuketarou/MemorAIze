'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DeckSetting } from '@/hooks/useDeckSetting';
import { FilterMode } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  value: DeckSetting;
  stats: Record<FilterMode, number>;
  onSave: (u: Partial<DeckSetting>) => void;
}

const modes: { key: FilterMode; label: string }[] = [
  { key: 'UNLEARNED', label: '未学習' },
  { key: 'STRUGGLING', label: '苦手' },
  { key: 'MASTERED', label: '覚えた' },
  { key: 'FAVORITE', label: 'お気に入り' },
];

export function SettingModal({
  open,
  onOpenChange,
  value,
  stats,
  onSave,
}: Props) {
  const toggleMode = (k: FilterMode) => {
    const s = new Set(value.filterMode);
    s.has(k) ? s.delete(k) : s.add(k);
    onSave({ filterMode: Array.from(s) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>学習設定</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 自動読み上げ */}
          <div className="flex items-center justify-between">
            <span>自動音声読み上げ</span>
            <Switch
              checked={value.autoSpeak}
              onCheckedChange={(v) => onSave({ autoSpeak: v })}
            />
          </div>

          {/* 表裏反転 */}
          <div className="flex items-center justify-between">
            <span>表裏を逆にする</span>
            <Switch
              checked={value.reverse}
              onCheckedChange={(v) => onSave({ reverse: v })}
            />
          </div>

          {/* フィルター：複数選択 */}
          <div>
            <p className="mb-1 font-medium">学習対象カード</p>
            <div className="grid grid-cols-2 gap-2">
              {modes.map(({ key, label }) => {
                const count = stats[key] ?? 0;
                const isChecked = value.filterMode.includes(key);
                const disabled = count === 0 && !isChecked;
                return (
                  <label
                    key={key}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded border',
                      disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-muted/50 cursor-pointer',
                    )}
                    title={
                      disabled
                        ? `${label} のカードが0件なので選択できません`
                        : undefined
                    }
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={disabled}
                      onCheckedChange={() => toggleMode(key)}
                    />
                    <span>
                      {label} ({count})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* シャッフル */}
          <div className="flex items-center justify-between">
            <span>出題順をシャッフル</span>
            <Switch
              checked={value.shuffle}
              onCheckedChange={(v) => onSave({ shuffle: v })}
            />
          </div>

          {/* 進捗リセット */}
          <Button
            variant="destructive"
            onClick={() => onSave({ reset: true } as any)}
            className="w-full"
          >
            進捗をリセット
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
