import React from 'react'
import { Post, Space } from '@subsocial/types/substrate/interfaces'
import HiddenSpaceButton from 'src/components/spaces/HiddenSpaceButton'
import HiddenPostButton from 'src/components/posts/HiddenPostButton'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import styles from './index.module.sass'
import { BareProps } from '../types'
import WarningPanel from '../WarningPanel'

export type BaseHiddenAlertProps = BareProps & {
  desc?: React.ReactNode,
  preview?: boolean,
  withIcon?: boolean,
  centered?: boolean
}

type HiddenAlertProps = BaseHiddenAlertProps & {
  type: 'post' | 'space' | 'comment',
  struct: Post | Space,
}

export const HiddenAlert = ({
  struct,
  type,
  desc,
  preview = false,
  centered = !preview,
  withIcon = preview,
  className,
  style
}: HiddenAlertProps) => {
  const isSpace = type === 'space';
  const address = struct.owner

  if (!struct.hidden.valueOf() || !isMyAddress(address)) return null;

  const HiddenButton = () => isSpace ? <HiddenSpaceButton space={struct as Space} /> : <HiddenPostButton post={struct as Post} />
  return <WarningPanel
    className={`${preview ? styles.DfHiddenAlertPreview : styles.DfHiddenAlertPage} ${className}`}
    style={style}
    desc={desc}
    actions={[<HiddenButton />]}
    centered={centered}
    withIcon={withIcon}
  />
}

export default HiddenAlert;
