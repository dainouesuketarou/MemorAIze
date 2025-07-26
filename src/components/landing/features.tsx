import {
  File as FilePdf,
  Image,
  LightbulbIcon,
  BarChart3,
  Share2,
  FolderTree,
} from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      icon: FilePdf,
      title: 'PDFからカード作成',
      description:
        '教科書やノートのPDFをアップロードするだけで、AIが自動的に最適な暗記カードを生成します。',
    },
    {
      icon: Image,
      title: '画像からカード作成',
      description:
        '手書きノートや教科書の写真をアップロードして、AIがテキストを認識し暗記カードに変換します。',
    },
    {
      icon: LightbulbIcon,
      title: 'AIによるカード最適化',
      description:
        'AIが生成したカードに対して追加指示を与えることで、より効果的な暗記カードに最適化できます。',
    },
    {
      icon: BarChart3,
      title: '暗記推移の可視化',
      description:
        '暗記カードの習得状況をグラフで可視化し、学習の進捗を一目で確認できます。',
    },
    {
      icon: FolderTree,
      title: 'カスタムグループ化',
      description:
        'ユーザーの好みに合わせて暗記帳をグループ化し、効率的に整理・管理できます。',
    },
    {
      icon: Share2,
      title: '暗記帳のインポート',
      description:
        '他のユーザーが作成した暗記帳を自分のアカウントにインポートして、すぐに学習を始めることができます。',
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
              AIで効率的な暗記学習を
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              MemorAIzeのAI機能で暗記学習を効率化。PDFや画像から簡単に暗記カードを作成し、学習をサポートします。
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
