# MemorAize Docker 環境ガイド (Supabase + Vercel)

## 🚨 現在の状況

プロジェクトは Supabase（データベース）と Vercel（デプロイ）を使用しています。Docker 環境は開発用として構築されています。

## ✅ 解決済みの問題

### 1. pnpm-lock.yaml の同期問題

**問題**: `pnpm-lock.yaml`が`package.json`と同期していない
**解決策**: `pnpm install`を実行して lockfile を更新

### 2. Docker ビルドの成功

**結果**: Docker イメージのビルドが正常に完了
**確認**: Next.js アプリケーションが正常に動作（http://localhost:3000）

## ⚠️ 現在の問題

### Supabase データベース接続エラー

**エラー**: `P1001: Can't reach database server at db.ddipuzqjkzberrcgaxnj.supabase.co:5432`

**原因**: Supabase プロジェクトが一時停止している可能性

## 🔧 解決策

### 1. Supabase プロジェクトの復元（推奨）

1. **Supabase ダッシュボードにアクセス**

   - https://supabase.com/dashboard
   - プロジェクト「MemorAize」を選択

2. **プロジェクトの復元**

   - 「Restore Project」をクリック
   - Pro プランにアップグレード（推奨）

3. **データベース接続の確認**
   ```bash
   # 接続テスト
   npm run docker:dev:migrate
   ```

### 2. 新しい Supabase プロジェクトの作成（代替案）

1. **新しいプロジェクトを作成**

   - https://supabase.com/dashboard
   - 「New Project」をクリック

2. **データベース URL を更新**

   ```bash
   # .envファイルを編集
   DATABASE_URL="postgresql://postgres:[new-password]@[new-host]:5432/postgres"
   ```

3. **マイグレーションの実行**
   ```bash
   npm run docker:dev:migrate
   ```

### 3. ローカル開発環境の使用

Supabase が利用できない場合、ローカル PostgreSQL を使用：

```bash
# ローカルPostgreSQLを起動
docker run --name local-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=memorize_db -p 5432:5432 -d postgres:15

# .envファイルを更新
DATABASE_URL="postgresql://postgres:password@localhost:5432/memorize_db"

# マイグレーションを実行
npm run docker:dev:migrate
```

## 🚀 現在利用可能なコマンド

### Docker 環境（Supabase 使用）

```bash
npm run docker:dev:start      # 開発環境起動
npm run docker:dev:stop       # 開発環境停止
npm run docker:dev:logs       # ログ表示
npm run docker:dev:shell      # コンテナ接続
npm run docker:dev:migrate    # マイグレーション
npm run docker:dev:seed       # シードデータ
npm run docker:dev:status     # 状態確認
```

### 直接実行（推奨）

```bash
npm run dev                   # 開発サーバー起動
npm run build                 # ビルド
npm run start                 # 本番サーバー起動
npm test                      # テスト実行
```

## 📊 現在の状況

- ✅ **Next.js アプリケーション**: 正常動作
- ✅ **Docker 環境**: 構築完了
- ✅ **pnpm 依存関係**: 同期済み
- ⚠️ **Supabase データベース**: 接続エラー
- ✅ **Vercel デプロイ**: 準備完了

## 🎯 次のステップ

### 即座に実行可能

```bash
# アプリケーションの起動（データベース不要）
npm run dev

# ブラウザでアクセス
open http://localhost:3000
```

### データベース機能のテスト

1. Supabase プロジェクトを復元
2. マイグレーションを実行
3. データベース機能をテスト

## 🔍 トラブルシューティング

### Supabase 接続エラーの確認

```bash
# データベースURLの確認
grep DATABASE_URL .env

# 接続テスト
npx prisma db pull
```

### 環境変数の確認

```bash
# 必要な環境変数
cat .env | grep -E "(DATABASE_URL|NEXTAUTH|STRIPE|OPENAI)"
```

## 📚 参考資料

- [Supabase 公式ドキュメント](https://supabase.com/docs)
- [Vercel 公式ドキュメント](https://vercel.com/docs)
- [Prisma 公式ドキュメント](https://www.prisma.io/docs/)

## 🆘 サポート

問題が解決しない場合は：

1. **Supabase ダッシュボード**でプロジェクトの状態を確認
2. **Vercel ダッシュボード**でデプロイメントの状態を確認
3. **ログファイル**で詳細なエラー情報を確認

現在、アプリケーション自体は正常に動作しているため、データベース接続を復元すれば完全に機能します。
