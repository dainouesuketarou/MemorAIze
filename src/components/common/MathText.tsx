import React from 'react';
import { MathRenderer } from './MathRenderer';

interface MathTextProps {
  text: string;
}

/**
 * テキスト中の$...$や$$...$$で囲まれたLaTeX数式部分だけを美しく表示し、
 * **...**で囲まれた部分は太字で表示するコンポーネント
 */
export const MathText: React.FC<MathTextProps> = ({ text }) => {
  // まず**...**で分割し、偶数indexは通常/数式、奇数indexは太字
  const boldSplit = text.split(/(\*\*[^*]+\*\*)/g);
  let key = 0;
  return (
    <>
      {boldSplit.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          // **...** 部分
          const inner = part.slice(2, -2);
          return (
            <strong key={key++} className="font-bold text-primary">
              <MathText text={inner} />
            </strong>
          );
        } else {
          // 通常部分は数式パース
          // 正規表現で$$...$$または$...$を抽出
          const regex = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;
          const parts = [];
          let lastIndex = 0;
          let match;
          while ((match = regex.exec(part)) !== null) {
            if (match.index > lastIndex) {
              parts.push(
                <span key={key++}>{part.slice(lastIndex, match.index)}</span>,
              );
            }
            const isBlock = match[0].startsWith('$$');
            parts.push(
              <span
                key={key++}
                className={isBlock ? 'block my-2 overflow-x-auto' : 'inline'}
              >
                <MathRenderer text={match[0]} displayMode={isBlock} />
              </span>,
            );
            lastIndex = regex.lastIndex;
          }
          if (lastIndex < part.length) {
            parts.push(<span key={key++}>{part.slice(lastIndex)}</span>);
          }
          return parts;
        }
      })}
    </>
  );
};
