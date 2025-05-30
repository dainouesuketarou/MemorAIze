import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t bg-background w-full">
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
              <h3 className="text-xl font-bold">MemorAIze</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AIを活用した暗記学習支援アプリ。効率的に学習し、記憶の定着を最大化します。
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider">
              法的情報
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t max-w-[1400px] mx-auto">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MemorAIze. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
