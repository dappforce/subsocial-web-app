/* eslint-disable @typescript-eslint/no-var-requires */
import { isEmptyStr } from '@subsocial/utils'

const remark = require('remark')
const strip = require('strip-markdown')
// const squeezeParagraphs = require('remark-squeeze-paragraphs')

const processMd = remark()
  .use(strip)
  // .use(squeezeParagraphs) // <-- doesn't work very well: leaves couple sequential new lines
  .processSync

export const mdToText = (md?: string) => {
  if (isEmptyStr(md)) return md

  return String(processMd(md) as string)
    // strip-markdown renders URLs as:
    // http&#x3A;//hello.com
    // so we need to fix this issue
    .replace(/&#x3A;/g, ':')
}
