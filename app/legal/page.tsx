import { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | MemorAIze',
  description: 'MemorAIzeの特定商取引法に基づく表記です。',
};

export default function LegalPage() {
  return (
    <LegalLayout title="特定商取引法に基づく表記">
      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-500 mb-8 text-center">
          最終更新日: {new Date().toLocaleDateString('ja-JP')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            販売事業者
          </h2>
          <p className="text-gray-700">DG Studio 後藤 大輝</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">所在地</h2>
          <p className="text-gray-700">
            所在地については、お取引の際に請求があれば遅滞なく開示いたします。
            <br />
            まずは下記メールアドレスまでご連絡ください。
            <br />
            メールアドレス: contact@dgstadio.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">商品名</h2>
          <p className="text-gray-700">MemorAIze サブスクリプションサービス</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">価格</h2>
          <p className="text-gray-700">
            月額プラン: 500円/月（税込）
            <br />
            年間プラン: 4800円/年（税込）
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            引き渡し時期
          </h2>
          <p className="text-gray-700">
            お申し込み完了後、即時にサービスをご利用いただけます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            お支払い方法
          </h2>
          <p className="text-gray-700">
            クレジットカード決済（VISA、Mastercard、American Express、JCB）
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            返品・キャンセルについて
          </h2>
          <p className="text-gray-700">
            デジタルコンテンツの性質上、ご購入後の返品はお受けできません。
            <br />
            キャンセルについては、以下の通りとなります：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>
              月額プラン：いつでもキャンセル可能です。キャンセル後は、現在の契約期間の終了までサービスをご利用いただけます。
            </li>
            <li>
              年間プラン：いつでもキャンセル可能です。キャンセル後は、現在の契約期間の終了までサービスをご利用いただけます。
            </li>
          </ul>
          <p className="mt-4 text-gray-700">
            例:月額プランをご契約後、キャンセルをされた場合、来月の支払日前日までサービスをご利用いただけます。
            <br />
            例:年間プランをご契約後、3ヶ月目にキャンセルされた場合、残りの9ヶ月間はサービスをご利用いただけます。
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
