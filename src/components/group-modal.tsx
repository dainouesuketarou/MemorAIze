import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
}

export const GroupModal = ({ isOpen, onClose, deckId }: GroupModalProps) => {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');

  const onSubmit = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to group deck');
      }

      toast.success('グループを作成しました');
      router.refresh();
      onClose();
    } catch (error) {
      toast.error('グループの作成に失敗しました');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>グループを作成</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="groupName"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              グループ名
            </label>
            <input
              id="groupName"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="グループ名を入力"
            />
          </div>
          <button
            onClick={onSubmit}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            作成
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
