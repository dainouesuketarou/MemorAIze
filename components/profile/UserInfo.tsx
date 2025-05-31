import React, { useState } from 'react';
import { User, Mail, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

interface UserInfoProps {
  username: string;
  email: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({ username, email }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(username);
  const user = useSelector((state: RootState) => state.user);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setEditName(username);
    setIsEditing(false);
  };
  const handleSave = () => {
    // ここでAPIやReduxでユーザー名を更新する処理を追加（現状はモック）
    // 例: dispatch(setUser({ name: editName }))
    setIsEditing(false);
  };

  return (
    <div className="bg-card rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-foreground">ユーザー情報</h2>
        {!isEditing && (
          <button
            className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors duration-200"
            aria-label="ユーザー名編集"
            onClick={handleEdit}
          >
            <Edit2 size={18} />
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {/* ユーザーの丸い形のアイコン */}
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                src={user?.image || '/profile.png'}
                alt={user?.name || '@user'}
                className="rounded-full h-8 w-8"
              />
              <AvatarFallback>
                {user?.name?.[0]?.toUpperCase() || 'ME'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-4 w-full">
            <p className="text-sm text-muted-foreground">ユーザー名</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 text-foreground bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <button
                  className="p-1 text-green-600 hover:bg-green-500/10 rounded transition-colors"
                  onClick={handleSave}
                  aria-label="保存"
                >
                  <Check size={18} />
                </button>
                <button
                  className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                  onClick={handleCancel}
                  aria-label="キャンセル"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <p className="font-medium text-foreground">{user.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Mail size={20} />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">メールアドレス</p>
            <p className="font-medium text-foreground">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
