import React from 'react'
import HiddenButton from './HiddenButton'
import { Post, Space } from '@subsocial/types/substrate/interfaces'
import { Alert } from 'antd'

type HiddenAlertProps = {
  type: 'posts' | 'spaces',
  struct: Post | Space
}

export const HiddenAlert = (props: HiddenAlertProps) => (
  <Alert
    message={
      <>
          This ${props.type} is hidden and only you can see it
        <HiddenButton {...props} />
      </>
    }
    banner
    closable
    type="warning"
    showIcon
  />
)

export default HiddenAlert;
