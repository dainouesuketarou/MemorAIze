import { CircleCheck, File as FilePdf, FileText, Image, LightbulbIcon, BarChart3, Share2, IterationCcw } from 'lucide-react';

export function LandingFeatures() {
  return (
    <section className="py-16 md:py-24" id="features">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              主な機能
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              AIでもっと効率的に暗記
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              MemorAIzeのAI機能で暗記学習を最適化。あなたの学習スタイルに合わせてカスタマイズできます。
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-16">
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FilePdf className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">PDFからカード作成</h3>
            <p className="text-center text-muted-foreground">
              教科書やノートをアップロードするだけでAIが自動的に最適な暗記カードを生成します。
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Image className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">画像認識</h3>
            <p className="text-center text-muted-foreground">
              手書きノートや教科書の写真からテキストを抽出し、暗記カードに変換します。
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LightbulbIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AIによる最適化</h3>
            <p className="text-center text-muted-foreground">
              あなたの学習パターンを分析し、知識の定着に最も効果的な復習タイミングを提案します。
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">学習進捗の可視化</h3>
            <p className="text-center text-muted-foreground">
              学習進捗をグラフで可視化し、得意分野と苦手分野を一目で把握できます。
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <IterationCcw className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">間隔反復学習</h3>
            <p className="text-center text-muted-foreground">
              科学的に実証された間隔反復学習法に基づき、効率的な復習スケジュールを提案します。
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Share2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">カード共有</h3>
            <p className="text-center text-muted-foreground">
              作成した暗記カードをクラスメイトや友人と簡単に共有できます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}