import { NextRequest, NextResponse } from 'next/server'
import { ImageAnnotatorClient } from '@google-cloud/vision'

export const runtime = 'nodejs'

const client = new ImageAnnotatorClient() // 環境変数から自動認証

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      )
    }

    // ファイルサイズ上限（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      )
    }

    // ArrayBuffer → Buffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // ── 画像もPDFも同じドキュメントOCRで処理 ──
    const [res] = await client.documentTextDetection({
      image: { content: uint8Array }
    })

    const text = res.fullTextAnnotation?.text ?? ''
    if (!text.trim()) {
      return NextResponse.json(
        { error: 'テキストを検出できませんでした' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { text }
    })
  } catch (e: any) {
    console.error('/api/upload error:', e)
    return NextResponse.json(
      { error: 'ファイルの処理に失敗しました' },
      { status: 500 }
    )
  }
}