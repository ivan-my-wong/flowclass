// @ts-ignore

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },

  ignorePatterns: [
    'dist',
    '.vscode/settings.json',
    'node_modules',
    'node_modules/**/*',
    '.idea/*',
    '.storyboard/*',
    'src/stories/*',
    'tests/**/*',
    '.eslintrc.js',
    '*.config.js',
    '*.config.ts',
  ],
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'airbnb',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: [
    'react',
    '@typescript-eslint',
    'import',
    'react-hooks',
    'prettier',
    'jsx-a11y',
    'simple-import-sort',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: ['./tsconfig.json', './tailwind.config.ts'], // Add this line
    tsconfigRootDir: __dirname, // Add this line
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['./tailwind.config.ts'],
      parserOptions: {
        project: null,
      },
    },
  ],

  // files: ['**/*.ts', '**/*.tsx'],
  rules: {
    'no-use-before-define': 'off',
    'no-underscore-dangle': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.tsx'],
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'linebreak-style': ['error', 'unix'],
    'object-shorthand': ['error', 'always'],
    '@typescript-eslint/consistent-type-assertions': 'error',
    'eol-last': 'off',
    'no-plusplus': 'off',
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreUrls: true,
      },
    ],

    'import/extensions': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Import React first
          ['^react$', 'react-router-dom'],
          // External libraries (everything from node_modules except React)
          ['^@?\\w'],
          ['^react-day-picker$', '^react-quill$', '^react-loading-skeleton$'],
          // Internal imports using @ alias (all directories inside src)
          ['^@(/.*|$)'],

          // Parent imports
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],

          // Sibling imports
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

          // Style imports
          ['^.+\\.s?css$'],

          // Side effect imports
          ['^\\u0000'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'import/no-unresolved': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',

    'arrow-parens': ['error', 'as-needed'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    'react/jsx-key': [
      'error',
      {
        checkKeyMustBeforeSpread: true,
        checkFragmentShorthand: false,
      },
    ],
    'import/prefer-default-export': 'off',
    'arrow-body-style': 'off',
    'react/prop-types': 'off',
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
    'import/no-extraneous-dependencies': 'off',
    'no-await-in-loop': 'off',
    // Do not give warning when any is used:
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/destructuring-assignment': 'off',
    '@typescript-eslint/ban-types': 'off',
    'jsx-a11y/no-static-element-interactions': [
      'error',
      {
        handlers: [
          'onClick',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
        allowExpressionValues: false,
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    'react/require-default-props': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'lf',
        tabWidth: 2,
      },
      {
        usePrettierrc: true,
      },
    ],
    indent: 'off',
    'react/no-array-index-key': 'warn',
    'react/jsx-no-bind': [
      'warn',
      {
        ignoreDOMComponents: true,
        ignoreRefs: true,
        allowArrowFunctions: true,
        allowFunctions: false,
        allowBind: false,
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
      // Boolean variables should start with 'is', 'has', 'show', 'open' or 'should'
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase'],
        prefix: ['is', 'has', 'should', 'show'],
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
