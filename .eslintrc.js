/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('@subsocial/config/eslintrc')

// add override for any (a metric ton of them, initial conversion)
module.exports = {
  ...base,
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'semi': [ 'warn', 'never' ],
    'react/prop-types': 'off',
    'quotes': [ 'warn', 'single' ],
    'array-bracket-spacing' : [ 'warn', 'always' ],
    'no-multi-spaces': 'error',
    'space-before-function-paren': [ 'warn', 'always' ],
    'non-nullish value': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/ban-types': 'off',
    'react-hooks/exhaustive-deps': 'off'
  }
}
