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

  if (!struct.hidden.valueOf() || !isMyAddress(struct.owner)) return null

  const HiddenButton = () => type === 'space'
    ? <HiddenSpaceButton space={struct as Space} />
    : <HiddenPostButton post={struct as Post} />

  const alertCss = preview
    ? styles.DfHiddenAlertPreview
    : styles.DfHiddenAlertPage

  return <WarningPanel
    className={`${alertCss} ${className}`}
    style={style}
    desc={desc || `This ${type} is unlisted and only you can see it`}
    actions={[<HiddenButton />]}
    centered={centered}
    withIcon={withIcon}
  />
}

export default HiddenAlert;
