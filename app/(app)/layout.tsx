import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <Toaster />
    </Providers>
  );
}
