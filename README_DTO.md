# DTO (Data Transfer Object) パターン実装

## 概要

このプロジェクトでは、API レイヤーでのデータ転送を改善するため、DTO（Data Transfer Object）パターンを採用しています。DTO を使用することで、型安全性の向上、バリデーションの統一、API コントラクトの明確化を実現しています。

## ディレクトリ構造

```
src/dto/
├── common/
│   └── base.dto.ts          # 共通のベース型とスキーマ
├── auth/
│   ├── onboarding.dto.ts    # オンボーディング関連DTO
│   └── login-history.dto.ts # ログイン履歴関連DTO
├── deck/
│   ├── deck.dto.ts          # デッキ基本操作DTO
│   ├── deck-setting.dto.ts  # デッキ設定DTO
│   └── deck-group.dto.ts    # デッキグループ関連DTO
├── card/
│   └── card.dto.ts          # カード関連DTO
├── study/
│   └── study.dto.ts         # 学習関連DTO
└── index.ts                 # DTOエクスポート
```

## 主要な特徴

### 1. 統一されたレスポンス形式

```typescript
// 基本レスポンス型
export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// 成功レスポンス
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

// エラーレスポンス
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
  timestamp: string;
}
```

### 2. Zod によるバリデーション

```typescript
// リクエストDTOの例
export const CreateDeckRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  cards: z
    .array(
      z.object({
        front: z.string().min(1, 'カードの表は必須です'),
        back: z.string().min(1, 'カードの裏は必須です'),
      }),
    )
    .min(1, '少なくとも1つのカードが必要です'),
  groupIds: z.array(z.string()).optional(),
});

export type CreateDeckRequest = z.infer<typeof CreateDeckRequestSchema>;
```

### 3. 型安全な API エンドポイント

```typescript
export async function POST(
  req: Request,
): Promise<NextResponse<CreateDeckResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です',
        } as CreateDeckResponse,
        { status: 401 },
      );
    }

    const body = await req.json();
    const validatedData = CreateDeckRequestSchema.parse(body);

    // ユースケース実行...

    const response: SuccessResponse<DeckData> = {
      success: true,
      data: result.deck,
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'デッキの作成に失敗しました',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
```

## 実装済み DTO

### 認証関連

- **`GetOnboardingStatusResponse`**: オンボーディング状況取得
- **`CompleteOnboardingRequest/Response`**: オンボーディング完了
- **`CreateLoginHistoryRequest/Response`**: ログイン履歴作成
- **`GetLoginHistoryResponse`**: ログイン履歴取得

### デッキ関連

- **`CreateDeckRequest/Response`**: デッキ作成
- **`UpdateDeckRequest/Response`**: デッキ更新
- **`GetDeckResponse`**: デッキ取得
- **`DeleteDeckResponse`**: デッキ削除
- **`GetDeckSettingResponse`**: デッキ設定取得
- **`UpdateDeckSettingRequest/Response`**: デッキ設定更新
- **`AddDeckToGroupRequest/Response`**: デッキをグループに追加
- **`UpdateDeckGroupsRequest/Response`**: デッキのグループ更新

### カード関連

- **`AddCardRequest/Response`**: カード追加
- **`UpdateCardRequest/Response`**: カード更新
- **`DeleteCardRequest/Response`**: カード削除
- **`SaveCardsRequest/Response`**: カード一括保存

### 学習関連

- **`CreateStudyHistoryRequest/Response`**: 学習履歴作成
- **`GetStudyHistoryResponse`**: 学習履歴取得
- **`UpdateStudyResultRequest/Response`**: 学習結果更新
- **`StudyDeckRequest/Response`**: デッキ学習

## 利点

### 1. 型安全性

- TypeScript の型チェックによるコンパイル時エラー検出
- API レスポンスの型保証
- リクエストデータの型検証

### 2. バリデーション統一

- Zod スキーマによる一貫したバリデーション
- カスタムエラーメッセージの提供
- 型推論による自動型生成

### 3. API コントラクト明確化

- 明確なリクエスト/レスポンス型定義
- フロントエンド開発時の型支援
- API 仕様の自動ドキュメント化

### 4. 保守性向上

- 統一されたレスポンス形式
- エラーハンドリングの標準化
- コードの可読性向上

### 5. 開発効率向上

- IDE の自動補完機能
- リファクタリング時の安全性
- テストコードの型安全性

## 使用方法

### 1. 新しい DTO の作成

```typescript
// src/dto/example/example.dto.ts
import { z } from 'zod';
import { BaseResponse } from '../common/base.dto';

export const ExampleRequestSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive(),
});

export type ExampleRequest = z.infer<typeof ExampleRequestSchema>;

export interface ExampleResponse
  extends BaseResponse<{
    id: string;
    name: string;
    value: number;
  }> {}
```

### 2. API エンドポイントでの使用

```typescript
export async function POST(
  req: Request,
): Promise<NextResponse<ExampleResponse>> {
  const body = await req.json();
  const validatedData = ExampleRequestSchema.parse(body);

  // 処理...

  return NextResponse.json({
    success: true,
    data: result,
  });
}
```

### 3. フロントエンドでの型利用

```typescript
import type { CreateDeckRequest, CreateDeckResponse } from '@/src/dto';

const createDeck = async (
  data: CreateDeckRequest,
): Promise<CreateDeckResponse> => {
  const response = await fetch('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
};
```

## 今後の拡張予定

1. **ページネーション対応**: 一覧取得 API でのページネーション
2. **ソート・フィルタリング**: 検索条件の標準化
3. **バッチ操作**: 複数リソースの一括操作
4. **リアルタイム通信**: WebSocket 対応 DTO
5. **ファイルアップロード**: ファイル処理用 DTO

## 注意事項

1. **バージョニング**: API の変更時は DTO のバージョン管理を考慮
2. **後方互換性**: 既存 API との互換性維持
3. **パフォーマンス**: 大きなデータセットでの DTO 変換コスト
4. **テスト**: DTO の単体テストと API 統合テスト

この DTO パターンの実装により、型安全で保守性の高い API レイヤーを構築しています。
