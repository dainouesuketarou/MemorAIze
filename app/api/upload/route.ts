import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60秒のタイムアウト

// Google Cloud クライアントの初期化関数
const getGoogleCloudClients = () => {
  let visionClient;
  let documentAiClient;

  // Vercel環境 (本番/プレビュー) での認証情報処理
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      visionClient = new ImageAnnotatorClient({ credentials });
      documentAiClient = new DocumentProcessorServiceClient({ credentials });
    } catch (error) {
      console.error('Failed to parse GOOGLE_CREDENTIALS_JSON:', error);
      // エラーが発生した場合、フォールバックせずにエラーをスローするか、
      // 機能限定で動作させる場合は、ここでエラーを適切に処理します。
      // ここでは、認証情報なしで初期化しようとするとエラーになるため、
      // 後の処理でクライアントの存在チェックが必要です。
      // または、アプリケーションの起動を妨げる致命的なエラーとして扱うこともできます。
      throw new Error('Google Cloudの認証情報(JSON)のパースに失敗しました。');
    }
  }
  // ローカル開発環境での認証情報処理 (GOOGLE_APPLICATION_CREDENTIALS ファイルパスを使用)
  else if (
    process.env.NODE_ENV !== 'production' &&
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    console.log('Using GOOGLE_APPLICATION_CREDENTIALS for local development.');
    visionClient = new ImageAnnotatorClient();
    documentAiClient = new DocumentProcessorServiceClient();
  }
  // 認証情報が見つからない場合
  else {
    console.error(
      'Google Cloud credentials not found. GOOGLE_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS must be set.',
    );
    // この場合、クライアントは未初期化のままなので、後続処理でチェックが必要
  }
  return { visionClient, documentAiClient };
};

export async function POST(req: NextRequest) {
  try {
    // Google Cloud クライアントを取得
    const { visionClient, documentAiClient } = getGoogleCloudClients();

    // クライアントが初期化されているか確認
    if (!visionClient || !documentAiClient) {
      throw new Error(
        'Google Cloudクライアントの初期化に失敗しました。認証情報を確認してください。',
      );
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

    if (!projectId || !processorId) {
      console.error(
        'Google Cloud Project ID or Document AI Processor ID is not set.',
      );
      throw new Error(
        'サーバー設定エラー: プロジェクトIDまたはプロセッサーIDが設定されていません。',
      );
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 },
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `ファイルサイズは${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB以下にしてください`,
        },
        { status: 400 },
      );
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'PDF、JPEG、PNGファイルのみアップロード可能です' },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let text = '';

    if (file.type === 'application/pdf') {
      const location = 'us'; // または 'eu'
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

      const request = {
        name,
        rawDocument: {
          content: Buffer.from(uint8Array).toString('base64'),
          mimeType: 'application/pdf',
        },
      };

      try {
        const [result] = await documentAiClient.processDocument(request);
        text = result.document?.text || '';
      } catch (error: any) {
        console.error('Document AI Error:', error);
        if (error.code === 7) {
          // Permission Denied
          throw new Error(
            'Document AIの権限が不足しています。Google Cloud Consoleで適切な権限を設定してください。',
          );
        }
        if (error.message?.includes('Document pages exceed the limit')) {
          throw new Error(
            'PDFのページ数が多すぎます。30ページ以下のPDFをアップロードしてください。',
          );
        }
        throw new Error(`PDFファイルの処理に失敗しました: ${error.message}`);
      }
    } else {
      // 画像ファイルの場合
      try {
        const [res] = await visionClient.documentTextDetection({
          image: { content: uint8Array },
        });
        text = res.fullTextAnnotation?.text || '';
      } catch (error: any) {
        console.error('Vision API Error:', error);
        if (error.code === 7) {
          // Permission Denied
          throw new Error(
            'Vision APIの権限が不足しています。Google Cloud Consoleで適切な権限を設定してください。',
          );
        }
        throw new Error(`画像ファイルの処理に失敗しました: ${error.message}`);
      }
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'テキストを検出できませんでした' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { text },
    });
  } catch (e: any) {
    console.error('/api/upload error:', e);
    return NextResponse.json(
      { error: e.message || 'ファイルの処理に失敗しました' },
      { status: 500 },
    );
  }
}
