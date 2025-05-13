import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GroupModal } from "@/components/group-modal";

interface DeckCardProps {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  progress: number;
}

export const DeckCard = ({
  id,
  title,
  description,
  cardCount,
  progress,
}: DeckCardProps) => {
  const router = useRouter();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const onDelete = async () => {
    try {
      const response = await fetch(`/api/decks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }

      toast.success("暗記帳を削除しました");
      router.refresh();
    } catch (error) {
      toast.error("暗記帳の削除に失敗しました");
    }
  };

  return (
    <>
      <div className="group relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsGroupModalOpen(true)}>
                グループ化
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600"
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{cardCount} カード</span>
            <span>{progress}% 完了</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        deckId={id}
      />
    </>
  );
}; 