module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "parent", "sibling", "index"],
        "pathGroups": [
          {
            "pattern": "@lib/**",
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "src/**",
            "group": "parent",
            "position": "after"
          }
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "alphabetize": {
          "order": "asc"
        },
        "newlines-between": "always"
      }
    ],
    "sort-imports": [
      "error",
      {
        "allowSeparatedGroups": true,
        "ignoreDeclarationSort": true,
      }
    ]
  },
};
