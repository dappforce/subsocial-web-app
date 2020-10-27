import { PlusOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import ButtonLink from 'src/components/utils/ButtonLink'
import { createNewPostLinkProps, isHiddenSpace, SpaceProps } from './common'

type Props = SpaceProps & ButtonProps & {
  title?: React.ReactNode
}

export const CreatePostButton = (props: Props) => {
  const { space, title = 'Create post' } = props

  if (isHiddenSpace(space)) return null

  return isMyAddress(space.owner)
    ? <ButtonLink
      {...props}
      type='primary'
      icon={<PlusOutlined />}
      ghost
      {...createNewPostLinkProps(space)}
    >
      {title}
    </ButtonLink>
    : null
}
