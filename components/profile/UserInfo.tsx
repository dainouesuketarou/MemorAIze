import React, { useState } from 'react';
import { User, Mail, Edit2, Check, X } from 'lucide-react';

interface UserInfoProps {
  username: string;
  email: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({ username, email }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(username);

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
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800">ユーザー情報</h2>
        {!isEditing && (
          <button
            className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors duration-200"
            aria-label="ユーザー名編集"
            onClick={handleEdit}
          >
            <Edit2 size={18} />
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <User size={20} />
          </div>
          <div className="ml-4 w-full">
            <p className="text-sm text-gray-500">ユーザー名</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 text-gray-800 w-full"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <button
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  onClick={handleSave}
                  aria-label="保存"
                >
                  <Check size={18} />
                </button>
                <button
                  className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                  onClick={handleCancel}
                  aria-label="キャンセル"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <p className="font-medium text-gray-800">{username}</p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <Mail size={20} />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">メールアドレス</p>
            <p className="font-medium text-gray-800">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
