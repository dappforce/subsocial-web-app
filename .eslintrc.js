/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('@subsocial/config/eslintrc');

// add override for any (a metric ton of them, initial conversion)
module.exports = {
  ...base,
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'semi': ["error", "warn"]
  }
}
