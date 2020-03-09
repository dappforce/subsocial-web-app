// eslint-disable-next-line @typescript-eslint/no-var-requires
const { writeFileSync } = require('fs');

require('dotenv').config();

const varsToExport = [
  'SUBSTRATE_URL',
  'ELASTIC_URL',
  'OFFCHAIN_URL',
  'APPS_URL'
]

const vals = varsToExport.map(varName => `${varName}: '${process.env[varName]}'`).join(',\n  ')
writeFileSync(`${__dirname}/public/env.js`,
  `// WARN: This is a generated file. Do not modify!

if (!window.process) window.process = {};
if (!window.process.ENV) window.process.ENV = {};

window.process.ENV = {
    I_AM_NOT_FROM_ENV: 'Haha',
  ${vals}
};
`,
  'utf8'
)
