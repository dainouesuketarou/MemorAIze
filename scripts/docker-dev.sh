#!/bin/bash

# 開発環境用Docker管理スクリプト (Supabase使用)

set -e

# 色付きの出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ヘルプ表示
show_help() {
    echo "MemorAize 開発環境 Docker管理スクリプト (Supabase使用)"
    echo ""
    echo "使用方法:"
    echo "  $0 [コマンド]"
    echo ""
    echo "コマンド:"
    echo "  start       - 開発環境を起動 (Supabase接続)"
    echo "  stop        - 開発環境を停止"
    echo "  restart     - 開発環境を再起動"
    echo "  build       - イメージをビルド"
    echo "  logs        - ログを表示"
    echo "  shell       - アプリケーションコンテナに接続"
    echo "  migrate     - データベースマイグレーションを実行"
    echo "  seed        - データベースにシードデータを投入"
    echo "  clean       - コンテナとボリュームを削除"
    echo "  status      - コンテナの状態を表示"
    echo "  help        - このヘルプを表示"
    echo ""
    echo "注意: このスクリプトはSupabaseデータベースを使用します。"
    echo "      .envファイルにDATABASE_URLが設定されている必要があります。"
}

# 環境変数ファイルのチェック
check_env_file() {
    if [ ! -f .env ]; then
        log_warning ".envファイルが見つかりません。テンプレートから作成します..."
        if [ -f env.example ]; then
            cp env.example .env
            log_success ".envファイルを作成しました。"
            log_warning "SupabaseのDATABASE_URLを設定してください。"
            log_info "例: DATABASE_URL=\"postgresql://postgres:[password]@[host]:5432/postgres\""
            exit 1
        else
            log_error "env.exampleファイルが見つかりません。"
            exit 1
        fi
    fi
    
    # DATABASE_URLのチェック
    if ! grep -q "DATABASE_URL=" .env; then
        log_error ".envファイルにDATABASE_URLが設定されていません。"
        log_info "SupabaseのデータベースURLを設定してください。"
        exit 1
    fi
}

# 開発環境を起動
start_dev() {
    log_info "開発環境を起動しています... (Supabase使用)"
    check_env_file
    
    # 既存のコンテナを停止
    docker compose -f docker-compose.dev.yml down
    
    # イメージをビルドして起動
    docker compose -f docker-compose.dev.yml up --build -d
    
    # アプリケーションの準備を待機
    log_info "アプリケーションの準備を待機中..."
    sleep 10
    
    # マイグレーションを実行
    log_info "データベースマイグレーションを実行中..."
    docker compose -f docker-compose.dev.yml run --rm migrate
    
    log_success "開発環境が起動しました！"
    log_info "アプリケーション: http://localhost:3000"
    log_info "データベース: Supabase (クラウド)"
    log_info ""
    log_info "Supabaseダッシュボードでデータベースを管理できます。"
}

# 開発環境を停止
stop_dev() {
    log_info "開発環境を停止しています..."
    docker compose -f docker-compose.dev.yml down
    log_success "開発環境を停止しました。"
}

# 開発環境を再起動
restart_dev() {
    log_info "開発環境を再起動しています..."
    stop_dev
    start_dev
}

# イメージをビルド
build_dev() {
    log_info "開発用イメージをビルドしています..."
    docker compose -f docker-compose.dev.yml build
    log_success "イメージのビルドが完了しました。"
}

# ログを表示
show_logs() {
    docker compose -f docker-compose.dev.yml logs -f
}

# アプリケーションコンテナに接続
shell_app() {
    log_info "アプリケーションコンテナに接続しています..."
    docker compose -f docker-compose.dev.yml exec app sh
}

# マイグレーションを実行
run_migrate() {
    log_info "データベースマイグレーションを実行中..."
    docker compose -f docker-compose.dev.yml run --rm migrate
    log_success "マイグレーションが完了しました。"
}

# シードデータを投入
run_seed() {
    log_info "シードデータを投入中..."
    docker compose -f docker-compose.dev.yml run --rm seed
    log_success "シードデータの投入が完了しました。"
}

# クリーンアップ
clean_dev() {
    log_warning "コンテナとボリュームを削除します。"
    read -p "続行しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "クリーンアップを実行中..."
        docker compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        log_success "クリーンアップが完了しました。"
    else
        log_info "クリーンアップをキャンセルしました。"
    fi
}

# 状態を表示
show_status() {
    log_info "コンテナの状態:"
    docker compose -f docker-compose.dev.yml ps
}

# メイン処理
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    build)
        build_dev
        ;;
    logs)
        show_logs
        ;;
    shell)
        shell_app
        ;;
    migrate)
        run_migrate
        ;;
    seed)
        run_seed
        ;;
    clean)
        clean_dev
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "不明なコマンド: $1"
        show_help
        exit 1
        ;;
esac
