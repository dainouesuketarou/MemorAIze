import { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata: Metadata = {
  title: '利用規約 | MemorAIze',
  description: 'MemorAIzeの利用規約です。',
};

export default function TermsPage() {
  return (
    <LegalLayout title="利用規約">
      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-500 mb-8 text-center">
          最終更新日: {new Date().toLocaleDateString('ja-JP')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. はじめに
          </h2>
          <p className="text-gray-700">
            本規約は、MemorAIze（以下「当サービス」）の利用条件を定めるものです。
            ユーザーの皆様は、本規約に同意の上、当サービスをご利用ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. 定義</h2>
          <p className="text-gray-700">
            本規約において、以下の用語は以下の意味で使用します：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>「ユーザー」とは、当サービスを利用する個人を指します。</li>
            <li>
              「コンテンツ」とは、当サービス上で作成、アップロード、共有される情報を指します。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. サービスの利用
          </h2>
          <p className="text-gray-700">
            当サービスは、以下の条件に従って利用することができます：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>ユーザーは、本規約に同意する必要があります。</li>
            <li>ユーザーは、正確な情報を提供する必要があります。</li>
            <li>
              ユーザーは、当サービスの利用に関連するすべての責任を負います。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. 禁止事項
          </h2>
          <p className="text-gray-700">
            ユーザーは、以下の行為を行ってはなりません：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>法令または公序良俗に違反する行為</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>他のユーザーに迷惑をかける行為</li>
            <li>当サービスの知的財産権を侵害する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            5. 免責事項
          </h2>
          <p className="text-gray-700">
            当サービスは、以下の事項について一切の責任を負いません：
          </p>
          <ul className="list-disc pl-6 mt-4 text-gray-700">
            <li>当サービスの利用により生じた損害</li>
            <li>当サービスの中断、停止、終了により生じた損害</li>
            <li>ユーザー間のトラブル</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            6. 規約の変更
          </h2>
          <p className="text-gray-700">
            当サービスは、必要に応じて本規約を変更することがあります。
            変更後の規約は、当サービス上に掲載された時点で効力を生じるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            7. 準拠法
          </h2>
          <p className="text-gray-700">
            本規約の解釈にあたっては、日本法を準拠法とします。
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
