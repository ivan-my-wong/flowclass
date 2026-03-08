const { trailingComma } = require('./.prettierrc')

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  globals: {
    Express: true,
    BufferEncoding: true,
    Stripe: true,
  },
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
  },

  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'no-use-before-define': 'off',
    'no-underscore-dangle': 'off',
    'linebreak-style': ['error', 'unix'],
    'object-shorthand': ['error', 'always'],
    '@typescript-eslint/consistent-type-assertions': 'error',
    'eol-last': 'off',
    'max-len': [
      'error',
      {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreUrls: true,
        ignorePattern: '^export class .+extends',
      },
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Packages first
          ['^\\u0000'],
          ['^node:'],
          // Packages from `node_modules`
          ['^@?\\w'],
          // Internal packages
          ['^(@|components|utils|services|config|hooks)(/.*|$)'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports
          ['^./[a-zA-Z]/[a-zA-Z][-][a-zA-Z][-][a-zA-Z]+.dto$'],
          ['^./[a-zA-Z]/[a-zA-Z][-][a-zA-Z]+.dto$'],
          // Style imports (CSS, SCSS, etc.)
          ['^.+\\.?(css|scss)$'],
          // Type imports (if using TypeScript with import type)
          ['^@?\\w.*\\.(types|interfaces)$', '^@?\\w.*\\.(dto|schema)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'no-unused-vars': 'off',
    // let unused-imports handle
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'warn',
    'arrow-parens': ['error', 'always'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'arrow-body-style': 'off',
    'no-useless-escape': 'off',
    // 'no-restricted-syntax': [
    //   'error',
    //   {
    //     selector: ':matches(ImportNamespaceSpecifier)',
    //     message: 'Import only modules you need',
    //   },
    // ],
    'no-shadow': 'off',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    '@typescript-eslint/no-shadow': ['off'],
    'no-await-in-loop': 'off',
    // Do not give warning when any is used:
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'lf',
        semi: false,
        trailingComma: 'es5',
      },
      {
        usePrettierrc: true,
      },
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      // Interface names must start with a capital I
      // {
      //   selector: 'interface',
      //   format: ['PascalCase'],
      //   prefix: ['I'],
      // },
      // Type alias names must use PascalCase
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      // Enum names must use PascalCase
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
      // Boolean variables should start with 'is', 'has', or 'should'
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase'],
        prefix: ['is', 'has', 'should'],
      },
      // Class names should use PascalCase
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      // Class methods should use camelCase
      {
        selector: 'classMethod',
        format: ['camelCase'],
      },
    ],
  },
}
