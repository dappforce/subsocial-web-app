import React from 'react'
import BN from 'bn.js'
import { Icon } from 'antd';
import { gtZero } from '.'

type IconWithTitleProps = {
  icon: JSX.Element | string,
  count: BN,
  label?: string
}

export const IconWithLabel = ({ icon, label, count }: IconWithTitleProps) => {
  const renderIcon = () => typeof icon === 'string' ? <Icon type={icon} /> : icon;
  const countStr = gtZero(count) ? count.toString() : undefined
  const renderText = () => <span className='ml-2'>
    {label
      ? <>
        {label}
        {countStr && ` (${countStr})`}
      </>
      : countStr}
  </span>

  return <>
    {renderIcon()}
    {renderText()}
  </>
}
