# pnpm 移行完了

このプロジェクトは npm から pnpm に完全移行しました。

## 移行内容

### 1. ファイル変更

- ✅ `package-lock.json` を削除
- ✅ `package.json` に `packageManager` フィールドを追加
- ✅ `package.json` に `postinstall` スクリプトを追加
- ✅ `.npmrc` ファイルを作成（pnpm 設定）
- ✅ `pnpm-workspace.yaml` を修正（packages フィールド追加）

### 2. 設定ファイル

- ✅ `Dockerfile.dev` - 既に pnpm 用に設定済み
- ✅ `docker-compose.dev.yml` - 既に pnpm 用に設定済み
- ✅ `scripts/docker-dev.sh` - 既に pnpm 用に設定済み

### 3. テスト結果

- ✅ `pnpm install` - 正常完了
- ✅ `pnpm test` - 全 325 テスト成功
- ✅ `pnpm run build` - 正常完了

## pnpm コマンド

### 基本コマンド

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# テスト実行
pnpm test

# テスト（監視モード）
pnpm test:watch

# テストカバレッジ
pnpm test:coverage

# リント
pnpm lint
```

### Docker 開発環境

```bash
# 開発環境起動
pnpm docker:dev:start

# 開発環境停止
pnpm docker:dev:stop

# ログ表示
pnpm docker:dev:logs

# コンテナシェル接続
pnpm docker:dev:shell
```

## pnpm 設定（.npmrc）

```ini
# pnpm設定
auto-install-peers=true
strict-peer-dependencies=false
save-exact=false
shamefully-hoist=true

# Prismaのビルド依存関係を無視
ignore-scripts=false

# パフォーマンス最適化
prefer-offline=true
cache-dir=~/.pnpm-cache
store-dir=~/.pnpm-store

# セキュリティ設定
audit-level=moderate
fund=false
```

## メリット

1. **高速インストール**: npm より約 2 倍高速
2. **ディスク容量削減**: ハードリンクによる効率的なストレージ使用
3. **厳密な依存関係管理**: phantom dependencies の防止
4. **モノレポ対応**: ワークスペース機能
5. **セキュリティ**: 厳密な依存関係チェック

## 注意事項

- `node_modules` ディレクトリは pnpm の独自構造になります
- IDE の設定で pnpm を認識させる必要がある場合があります
- CI/CD パイプラインでも pnpm コマンドを使用してください

## トラブルシューティング

### 依存関係の問題

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
pnpm install
```

### キャッシュクリア

```bash
# pnpmキャッシュをクリア
pnpm store prune
```

### バージョン確認

```bash
pnpm --version
# 現在: 9.0.0
```

## 移行日時

2024 年 12 月 22 日 - npm から pnpm への完全移行完了
