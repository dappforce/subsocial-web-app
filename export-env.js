// eslint-disable-next-line @typescript-eslint/no-var-requires
const { writeFileSync } = require('fs');

require('dotenv').config();

const varsToExport = [
  'SUBSTRATE_URL',
  'ELASTIC_URL',
  'OFFCHAIN_URL',
  'OFFCHAIN_WS',
  'APPS_URL',
  'IPFS_URL',
  'LOG_LEVEL'
]

function getSerializedVal(varName) {
  const val = process.env[varName]
  return typeof val === 'string' ? `'${val}'` : val
}

const vals = varsToExport
  .map(varName => `${varName}: ${getSerializedVal(varName)}`)
  .join(',\n  ')

const jsFile = `${__dirname}/public/env.js`

console.log(`Export .env to ${jsFile}`)

writeFileSync(jsFile,
  `// WARN: This is a generated file. Do not modify!

if (!window.process) window.process = {};
if (!window.process.ENV) window.process.ENV = {};

window.process.env = {
  ${vals}
};
`, 'utf8'
)
