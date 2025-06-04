import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface MathRendererProps {
  text: string;
  displayMode?: boolean;
}

/**
 * LaTeX数式を美しく表示する共通コンポーネント
 * @param text LaTeX記法の数式
 * @param displayMode ディスプレイ数式か（デフォルト:インライン）
 */
export const MathRenderer = ({
  text,
  displayMode = false,
}: MathRendererProps) => {
  // $...$ で囲まれていればインライン、$$...$$ で囲まれていればディスプレイ
  if (displayMode || /^\$\$[\s\S]*\$\$$/.test(text)) {
    // $$...$$を除去
    const clean = text.replace(/^\$\$|\$\$$/g, '');
    return <BlockMath math={clean} />;
  }
  if (/^\$[\s\S]*\$$/.test(text)) {
    // $...$を除去
    const clean = text.replace(/^\$|\$$/g, '');
    return <InlineMath math={clean} />;
  }
  // それ以外は通常テキストとして表示
  return <span>{text}</span>;
};
