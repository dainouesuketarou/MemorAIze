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
import { useCallback, useMemo } from 'react';

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
  // モード切り替えをメモ化
  const toggleMode = useCallback(
    (k: FilterMode) => {
      const s = new Set(value.filterMode);
      s.has(k) ? s.delete(k) : s.add(k);
      onSave({ filterMode: Array.from(s) });
    },
    [value.filterMode, onSave],
  );

  // モードの選択状態をメモ化
  const modeStates = useMemo(
    () =>
      modes.map(({ key, label }) => ({
        key,
        label,
        count: stats[key] ?? 0,
        isChecked: value.filterMode.includes(key),
        disabled: stats[key] === 0 && !value.filterMode.includes(key),
      })),
    [stats, value.filterMode],
  );

  // 設定変更をメモ化
  const handleSettingChange = useCallback(
    (key: keyof DeckSetting, newValue: any) => {
      onSave({ [key]: newValue });
    },
    [onSave],
  );

  // 再スタート処理をメモ化
  const handleRestart = useCallback(() => {
    onSave({ reset: true } as any);
    onOpenChange(false);
  }, [onSave, onOpenChange]);

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
              onCheckedChange={(v) => handleSettingChange('autoSpeak', v)}
            />
          </div>

          {/* 表裏反転 */}
          <div className="flex items-center justify-between">
            <span>表裏を逆にする</span>
            <Switch
              checked={value.reverse}
              onCheckedChange={(v) => handleSettingChange('reverse', v)}
            />
          </div>

          {/* フィルター：複数選択 */}
          <div>
            <p className="mb-1 font-medium">学習対象カード</p>
            <div className="grid grid-cols-2 gap-2">
              {modeStates.map(({ key, label, count, isChecked, disabled }) => (
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
              ))}
            </div>
          </div>

          {/* シャッフル */}
          <div className="flex items-center justify-between">
            <span>出題順をシャッフル</span>
            <Switch
              checked={value.shuffle}
              onCheckedChange={(v) => handleSettingChange('shuffle', v)}
            />
          </div>

          {/* 再スタートボタン */}
          <Button variant="default" onClick={handleRestart} className="w-full">
            暗記カードを再スタートする
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
