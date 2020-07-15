import React from 'react'
import BN from 'bn.js'
import { gtZero } from '.'

type IconWithTitleProps = {
  icon: JSX.Element,
  count?: BN,
  label?: string
}

export const IconWithLabel = ({ icon, label, count = new BN(0) }: IconWithTitleProps) => {
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
    {icon}
    {renderText()}
  </>
}
