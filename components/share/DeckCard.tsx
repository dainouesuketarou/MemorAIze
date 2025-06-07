import React from 'react';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeckCardProps {
  title: string;
  description?: string | null;
  cardCount: number;
  groups?: { name: string }[];
  shareCode?: string | null;
  onCopyShareCode?: (code: string) => void;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  title,
  description,
  cardCount,
  groups,
  shareCode,
  onCopyShareCode,
  onClick,
  children,
}) => {
  return (
    <div
      className={cn(
        'bg-card rounded-lg shadow-sm p-4 mb-4 flex flex-col cursor-pointer hover:shadow-md transition-all border border-border',
        onClick && 'hover:bg-accent/5',
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-foreground truncate">{title}</h3>
        {shareCode && (
          <button
            className="flex items-center text-primary hover:text-primary/80 text-xs ml-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (onCopyShareCode) onCopyShareCode(shareCode);
              navigator.clipboard.writeText(shareCode);
            }}
            title="共有IDをコピー"
          >
            <Copy size={16} className="mr-1" />
            {shareCode}
          </button>
        )}
      </div>
      {description && (
        <p className="text-muted-foreground text-sm mb-2 truncate">
          {description}
        </p>
      )}
      <div className="flex items-center text-xs text-muted-foreground mb-2">
        <span>カード枚数: {cardCount}</span>
        {groups && groups.length > 0 && (
          <span className="ml-4">
            グループ: {groups.map((g) => g.name).join(', ')}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};
