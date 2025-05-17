import pluginNext from '@next/eslint-plugin-next';
import tsParser from '@typescript-eslint/parser';
import pluginPrettier from 'eslint-plugin-prettier';

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  {
    // 対象ファイル
    files: ['**/*.{js,jsx,ts,tsx}'],
    // 除外フォルダ
    ignores: ['node_modules', '.next', 'out'],
    // パーサー設定
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    // プラグイン登録
    plugins: {
      '@next/next': pluginNext,
      prettier: pluginPrettier,
    },
    // ルール定義
    rules: {
      // Next.js 推奨ルール一式
      ...pluginNext.configs.recommended.rules,
      // Prettier のフォーマット違反を ESLint エラーにする
      'prettier/prettier': 'error',
      // React 17+ では不要
      'react/react-in-jsx-scope': 'off',
      // TypeScript の戻り型明示はオフ
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
