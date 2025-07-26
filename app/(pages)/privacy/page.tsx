import { Metadata } from 'next';
import { LegalLayout } from '@/src/components/legal/legal-layout';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | MemorAIze',
  description: 'MemorAIzeのプライバシーポリシーです。',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー">
      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-500 mb-8 text-center">
          最終更新日: {new Date().toLocaleDateString('ja-JP')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. 個人情報の取り扱いについて
          </h2>
          <p className="text-gray-700">
            MemorAIze（以下「当サービス」）は、ユーザーの個人情報の保護を最重要事項と考えています。
            本プライバシーポリシーでは、当サービスにおける個人情報の取り扱いについて定めています。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            2. 収集する情報
          </h2>
          <p className="text-gray-700">
            当サービスは、以下の情報を収集する場合があります：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>氏名、メールアドレス等の登録情報</li>
            <li>学習履歴、進捗状況等の利用データ</li>
            <li>デバイス情報、IPアドレス等の技術的情報</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. 情報の利用目的
          </h2>
          <p className="text-gray-700">
            収集した情報は、以下の目的で利用されます：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>サービスの提供・運営</li>
            <li>ユーザーサポート</li>
            <li>サービスの改善・開発</li>
            <li>セキュリティの確保</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. 情報の管理
          </h2>
          <p className="text-gray-700">
            当サービスは、収集した個人情報の管理について、以下の対策を実施しています：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>アクセス制限の実施</li>
            <li>データの暗号化</li>
            <li>セキュリティ対策の実施</li>
            <li>従業員への教育・監督</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            5. 情報の第三者提供
          </h2>
          <p className="text-gray-700">
            当サービスは、以下の場合を除き、個人情報を第三者に提供することはありません：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            6. ユーザーの権利
          </h2>
          <p className="text-gray-700">ユーザーは、以下の権利を有します：</p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>個人情報の開示請求</li>
            <li>個人情報の訂正・削除請求</li>
            <li>利用停止・消去請求</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            7. プライバシーポリシーの変更
          </h2>
          <p className="text-gray-700">
            当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
            変更後のプライバシーポリシーは、当サービス上に掲載された時点で効力を生じるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            8. お問い合わせ
          </h2>
          <p className="text-gray-700">
            本プライバシーポリシーに関するお問い合わせは、以下の連絡先までご連絡ください：
          </p>
          <p className="mt-4 text-gray-700">
            メールアドレス: support@memoraize.com
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
