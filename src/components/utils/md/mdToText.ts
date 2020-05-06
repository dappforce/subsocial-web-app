/* eslint-disable @typescript-eslint/no-var-requires */
import { isEmptyStr } from '@subsocial/utils'

const remark = require('remark')
const strip = require('strip-markdown')
// const squeezeParagraphs = require('remark-squeeze-paragraphs')

const processMd = remark()
  .use(strip)
  // .use(squeezeParagraphs) // <-- doesn't work very well: leaves couple sequential new lines
  .process

export async function mdToText (md?: string) {
  return isEmptyStr(md)
    ? md
    : String(await processMd(md) as string)
}

export default mdToText
