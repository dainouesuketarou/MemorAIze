import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileHeaderProps {
  username: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ username }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <button
          className="mr-4 p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          aria-label="戻る"
          onClick={() => router.push('/dashboard')}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            プロフィール
          </h1>
          <p className="text-gray-500">アカウント設定・各種情報</p>
        </div>
      </div>
    </div>
  );
};
