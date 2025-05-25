import {
  CircleCheck,
  File as FilePdf,
  FileText,
  Image,
  LightbulbIcon,
  BarChart3,
  Share2,
  IterationCcw,
} from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      icon: FilePdf,
      title: 'PDFからカード作成',
      description:
        '教科書やノートをアップロードするだけでAIが自動的に最適な暗記カードを生成します。',
    },
    {
      icon: Image,
      title: '画像認識',
      description:
        '手書きノートや教科書の写真からテキストを抽出し、暗記カードに変換します。',
    },
    {
      icon: LightbulbIcon,
      title: 'AIによる最適化',
      description:
        'あなたの学習パターンを分析し、知識の定着に最も効果的な復習タイミングを提案します。',
    },
    {
      icon: BarChart3,
      title: '学習進捗の可視化',
      description:
        '学習進捗をグラフで可視化し、得意分野と苦手分野を一目で把握できます。',
    },
    {
      icon: IterationCcw,
      title: '間隔反復学習',
      description:
        '科学的に実証された間隔反復学習法に基づき、効率的な復習スケジュールを提案します。',
    },
    {
      icon: Share2,
      title: 'カード共有',
      description:
        '作成した暗記カードをクラスメイトや友人と簡単に共有できます。',
    },
  ];

  return (
    <section
      className="py-16 md:py-24 w-full"
      id="features"
      aria-labelledby="features-heading"
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-[1400px] mx-auto">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              主な機能
            </div>
            <h2
              id="features-heading"
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            >
              AIでもっと効率的に暗記
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              MemorAIzeのAI機能で暗記学習を最適化。あなたの学習スタイルに合わせてカスタマイズできます。
            </p>
          </div>
        </div>
        <div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-16 max-w-[1400px] mx-auto"
          role="list"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
              role="listitem"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                aria-hidden="true"
              >
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
