import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store/store';
import { Button } from '@/src/components/ui/button';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportDeckButtonProps {
  onImport: () => void;
}

export const ImportDeckButton: React.FC<ImportDeckButtonProps> = ({
  onImport,
}) => {
  const router = useRouter();
  const subscription = useSelector(
    (state: RootState) => state.user.subscription,
  );
  const isProUser =
    subscription?.plan === 'PRO_MONTHLY' || subscription?.plan === 'PRO_YEARLY';

  const handleClick = () => {
    if (isProUser) {
      onImport();
    } else {
      router.push('/subscription');
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={isProUser ? 'default' : 'outline'}
      className={`gap-2 ${!isProUser ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {!isProUser && <Lock size={16} />}
      {isProUser ? 'デッキをインポート' : 'プロプランでロック解除'}
    </Button>
  );
};
