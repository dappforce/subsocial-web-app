import React from 'react'
import { isBrowser } from 'src/config/Size.config';
import { Tag } from 'antd';

type Props = React.PropsWithChildren<{
  isMy?: boolean
}>

export const MyEntityLabel = ({ isMy = false, children }: Props) =>
  isBrowser && isMy
    ? <Tag color='green' className='ml-3'>{children}</Tag>
    : null

export default MyEntityLabel
