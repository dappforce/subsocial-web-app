import React from 'react'
import { Tag } from 'antd';
import { useResponsiveSize } from '../responsive';

type Props = React.PropsWithChildren<{
  isMy?: boolean
}>

export const MyEntityLabel = ({ isMy = false, children }: Props) => {
  const { isNotMobile } = useResponsiveSize()
  return isNotMobile && isMy
    ? <Tag color='green'>{children}</Tag>
    : null
}
export default MyEntityLabel
