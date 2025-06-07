/**
 * AI生成制限の型定義
 */

/**
 * AI生成制限の基本情報
 */
export interface AiGenerationLimit {
  /** 制限ID */
  id: string;
  /** ユーザーID */
  userId: string;
  /** 1ヶ月の制限回数（無料プランは5回） */
  monthlyLimit: number;
  /** 1ヶ月の使用回数 */
  monthlyUsage: number;
  /** 最後に月次リセットされた日時 */
  lastResetMonth: Date;
}

/**
 * AI生成制限の状態
 */
export interface AiGenerationLimitState {
  /** 制限情報 */
  limit: AiGenerationLimit | null;
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
}

/**
 * AI生成制限の更新パラメータ
 */
export interface UpdateAiGenerationLimitParams {
  /** 1ヶ月の使用回数 */
  monthlyUsage: number;
}

/**
 * AI生成制限のAPIレスポンス
 */
export interface AiGenerationLimitResponse {
  /** 制限情報 */
  limit: AiGenerationLimit;
  /** エラーメッセージ */
  error?: string;
}
