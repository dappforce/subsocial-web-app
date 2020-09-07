import { AnyText, stringifyText } from '../substrate';
import { nonEmptyStr, nonEmptyArr } from '@subsocial/utils';

export const openNewWindow = (url: string) => window.open(url, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400');

export function slugify (text?: AnyText): string | undefined {
  let slug: string | undefined
  if (nonEmptyStr(text)) {
    slug = stringifyText(text)
    if (slug && !slug.startsWith('@')) {
      slug = '@' + slug
    }
  }
  return slug
}

export function stringifySubUrls (...subUrls: string[]): string {
  if (nonEmptyArr(subUrls)) {
    const res: string[] = [ '' ]
    subUrls.forEach(url => {
      if (nonEmptyStr(url)) {
        if (url.startsWith('/')) {
          url = url.substring(1) // Drop the first '/'
        }
        res.push(url)
      }
    })
    return res.join('/')
  }
  return ''
}

type ShareLinkProps = {
  url: string,
  children: React.ReactNode,
}

export const ShareLink = ({ url, children }: ShareLinkProps) => <a className='DfBlackLink' onClick={() => openNewWindow(url)}>{children}</a>
