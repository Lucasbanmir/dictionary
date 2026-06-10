import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTs from 'eslint-config-next/typescript.js';

const eslintConfig = defineConfig([
  nextVitals,
  nextTs,
  {
    rules: {
      'semi': 'warn',
      'object-curly-spacing': ['warn', 'always'],
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // './src/tests/**'
  ]),
]);

export default eslintConfig;
