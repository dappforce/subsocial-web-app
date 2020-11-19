import React from 'react';
import { AnyText, stringifyText } from '../substrate';
import { nonEmptyStr, nonEmptyArr } from '@subsocial/utils';
import { BareProps } from '../utils/types';
import copy from 'copy-to-clipboard';
import { showInfoMessage } from '../utils/Message';
import { appBaseUrl } from '../utils/env';

export const openNewWindow = (url: string) => window.open(url, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400');

export function slugifyHandle (text?: AnyText): string | undefined {
  let slug = stringifyText(text)

  if (slug && !slug.startsWith('@')) {
    slug = '@' + slug
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

type BlackLinkProps = BareProps & Partial<ShareLinkProps> & {
  onClick?: () => void
}

export const BlackLink = ({ children, className, style, onClick }: BlackLinkProps) =>
  <a className={'DfBlackLink ' + className} onClick={onClick} style={style}>{children}</a>

export const ShareLink = ({ url, children }: ShareLinkProps) =>
  <BlackLink onClick={() => openNewWindow(url)}>{children}</BlackLink>

type CopyProps = {
  text: string,
  message: string,
  children: React.ReactNode
}

export const Copy = ({ text, message, children }: CopyProps) => <BlackLink
  onClick={() => {
    copy(text)
    showInfoMessage(message)
  }}
>{children}</BlackLink>
