module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  plugins: ['simple-import-sort', 'unused-imports', 'prettier', 'import'],
  parserOptions: { ecmaVersion: 12 }, // to enable features such as async/await
  ignorePatterns: ['node_modules/*', '.next/*', '.out/*', '!.prettierrc.js', 'i18n.js'], // We don't want to lint generated files nor node_modules, but we want to lint .prettierrc.js (ignored by default by eslint)
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:import/recommended',
    'plugin:@next/next/recommended',
    'next',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: { react: { version: 'detect' } },
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // TypeScript rules
        'plugin:react/recommended', // React rules

        'plugin:jsx-a11y/recommended', // Accessibility rules
        'prettier/@typescript-eslint', // Prettier plugin
        'plugin:prettier/recommended', // Prettier recommended rules
      ],
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
        'max-len': [
          'error',
          {
            code: 100,
            ignoreComments: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
            ignoreUrls: true,
          },
        ],
        'import/extensions': 'off',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/named': 'off',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'no-unused-vars': 'off',
        // let unused-imports handle
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': 'warn',
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
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'react/destructuring-assignment': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'react/require-default-props': 'off',
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'lf',
          },
          {
            usePrettierrc: true,
          },
        ],
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
        '@typescript-eslint/no-explicit-any': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        // 'react-hooks/exhaustive-deps': 'off',

        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Import React first

              ['^next(/.*|$)', '^react$', 'react-router-dom'],
              ['recoil'],
              ['^@?\\w'],
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
        'react/self-closing-comp': [
          'error',
          {
            component: true,
            html: true,
          },
        ],
        'no-return-await': 'error',
      },
    },
  ],
}
