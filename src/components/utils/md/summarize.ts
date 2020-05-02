import { mdToText } from './mdToText'
import { summarize } from '../text'

export async function summarizeMd (md?: string, limit?: number) {
  const text = await mdToText(md)
  return summarize(text, limit)
}

export default summarizeMd
