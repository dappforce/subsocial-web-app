/* eslint-disable @typescript-eslint/no-var-requires */
import { isEmptyStr } from '@subsocial/utils'

const remark = require('remark')
const strip = require('strip-markdown')

const stripMd = remark().use(strip).process

export async function mdToText (md?: string) {
  return isEmptyStr(md)
    ? md
    : String(await stripMd(md) as string)
}

export default mdToText
