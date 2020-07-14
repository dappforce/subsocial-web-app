import React from 'react'
import { Post, Space } from '@subsocial/types/substrate/interfaces'
import { Alert } from 'antd'
import HiddenSpaceButton from 'src/components/spaces/HiddenSpaceButton'
import HiddenPostButton from 'src/components/posts/HiddenPostButton'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import styles from './index.module.sass'
import { BareProps } from '../types'

export type BaseHiddenAlertProps = BareProps & {
  desc?: React.ReactNode,
  preview?: boolean,
  withIcon?: boolean,
  centered?: boolean
}

type HiddenAlertProps = BaseHiddenAlertProps & {
  type: 'post' | 'space',
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
  const address = isSpace ? (struct as Space).owner : struct.created.account

  if (!struct.hidden.valueOf() || !isMyAddress(address)) return null;

  const HiddenButton = () => isSpace ? <HiddenSpaceButton space={struct as Space} /> : <HiddenPostButton post={struct as Post} />
  return <Alert
    className={`${preview ? styles.DfHiddenAlertPreview : styles.DfHiddenAlert} ${className}`}
    style={style}
    message={
      <div className={`d-flex ${centered ? 'justify-content-center' : 'justify-content-between'}`}>
        {desc || `This ${type} is hidden and only you can see it`}
        <HiddenButton />
      </div>
    }
    banner
    showIcon={withIcon}
    type="warning"
  />
}

export default HiddenAlert;
