import { z } from 'zod';

/**
 * APIレスポンスの基本型
 */
export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * エラーレスポンスの型
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
  timestamp: string;
}

/**
 * 成功レスポンスの型
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * ページネーション情報の型
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ページネーション付きレスポンスの型
 */
export interface PaginatedResponse<T = any> extends BaseResponse<T[]> {
  pagination: PaginationInfo;
}

/**
 * 共通のクエリパラメータ用スキーマ
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * 共通のソート用スキーマ
 */
export const SortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 共通の日付範囲クエリスキーマ
 */
export const DateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
