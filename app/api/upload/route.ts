import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5分のタイムアウト

// 認証情報の確認
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('GOOGLE_APPLICATION_CREDENTIALSが設定されていません');
}

const visionClient = new ImageAnnotatorClient();
const documentAiClient = new DocumentProcessorServiceClient();

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 },
      );
    }

    // ファイルサイズ上限（10MB）
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

    // ファイルタイプの検証
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'PDF、JPEG、PNGファイルのみアップロード可能です' },
        { status: 400 },
      );
    }

    // ArrayBuffer → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let text = '';

    // PDFファイルの場合
    if (file.type === 'application/pdf') {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT;
      const location = 'us'; // または 'eu'
      const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

      if (!projectId || !processorId) {
        throw new Error(
          'Document AIの設定が不足しています。GOOGLE_CLOUD_PROJECTとDOCUMENT_AI_PROCESSOR_IDを確認してください。',
        );
      }

      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error(
          'Google Cloud認証情報が設定されていません。GOOGLE_APPLICATION_CREDENTIALSを確認してください。',
        );
      }

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
