/* eslint-disable @typescript-eslint/no-var-requires */
import { isEmptyStr } from '@subsocial/utils'
import mdToTextSync from 'markdown-to-txt'

const remark = require('remark')
const strip = require('strip-markdown')
// const squeezeParagraphs = require('remark-squeeze-paragraphs')

const processMd = remark()
  .use(strip)
  // .use(squeezeParagraphs) // <-- doesn't work very well: leaves couple sequential new lines
  .process // TODO check out there is processSync https://github.com/unifiedjs/unified#processorprocesssyncfilevalue

export const mdToTextAsync = async (md?: string) =>
  isEmptyStr(md) ? md : String(await processMd(md) as string)

export const mdToText = (md?: string) =>
  isEmptyStr(md) ? md : mdToTextSync(md, { escapeHtml: false })
