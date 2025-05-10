"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';

interface Props {
  deckId: string | string[];
  onSuccess: () => void;
}

export function CardAddAiForm({ deckId, onSuccess }: Props) {
  const [content, setContent] = useState('');
  const [cardFormat, setCardFormat] = useState('term-meaning');
  const [cardCount, setCardCount] = useState(10);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: APIでAIカード生成&追加
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 font-medium">学習内容</label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="テキストを入力してください"
          className="min-h-[80px]"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">ファイルアップロード</label>
        <Input type="file" multiple onChange={handleFileChange} />
        {uploadedFiles.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {uploadedFiles.map((file, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>{file.name}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeFile(i)}>
                  削除
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">カードの形式</label>
        <select value={cardFormat} onChange={e => setCardFormat(e.target.value)} className="w-full border rounded p-2">
          <option value="term-meaning">表:単語/裏:意味</option>
          <option value="question-answer">表:問題/裏:答え</option>
          <option value="custom">カスタム</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">カード枚数</label>
        <Input type="number" min={1} max={100} value={cardCount} onChange={e => setCardCount(Number(e.target.value))} />
      </div>
      <div>
        <label className="block mb-1 font-medium">追加指示 (オプション)</label>
        <Textarea value={additionalInstructions} onChange={e => setAdditionalInstructions(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (<><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />生成中...</>) : 'AIでカードを追加'}
      </Button>
    </form>
  );
} 