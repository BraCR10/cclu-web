import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Text a person reads comes from the message files, never from the markup.
    files: ['src/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': ['error', { noStrings: false, ignoreProps: true }],
    },
  },
  {
    // A date is shown through next-intl, which knows the chamber's time zone.
    // Formatting one by hand reads it in whatever zone the browser is in, and
    // can name the wrong day.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']",
          message: 'Format dates with useDates from @/shared/hooks/useDates.',
        },
        {
          selector:
            'CallExpression[callee.property.name=/^toLocale(Date|Time)?String$/][arguments.length>0]',
          message: 'Format dates with useDates from @/shared/hooks/useDates.',
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
