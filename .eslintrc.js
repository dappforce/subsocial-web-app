const base = require('@polkadot/dev-react/config/eslint');

// add override for any (a metric ton of them, initial conversion)
module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: [
      './tsconfig.json'
    ]
  },
  rules: {
    ...base.rules,
    'semi': 'off',
    'comma-spacing': 'warn',
    'array-bracket-spacing': ['warn', "always"],
    'react/display-name': 'off',
    'padded-blocks': 'off',
    'prefer-promise-reject-errors': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/indent': ['warn', 2],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/prefer-interface': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/camelcase': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/array-type': 'off'
  }
};
