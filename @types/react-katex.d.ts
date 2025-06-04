declare module 'react-katex' {
  import * as React from 'react';
  export interface BlockMathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }
  export interface InlineMathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }
  export const BlockMath: React.FC<BlockMathProps>;
  export const InlineMath: React.FC<InlineMathProps>;
}
