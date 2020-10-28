import { PlusOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import ButtonLink from 'src/components/utils/ButtonLink'

export const CreateSpaceButton = ({
  children,
  type = 'primary',
  ghost = true,
  ...otherProps
}: ButtonProps) => {
  const props = { type, ghost, ...otherProps }
  const newSpacePath = '/spaces/new'

  return <ButtonLink href={newSpacePath} as={newSpacePath} {...props}>
    {children || <span><PlusOutlined /> Create space</span>}
  </ButtonLink>
}
