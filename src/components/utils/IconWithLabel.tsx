import React from 'react'

type IconWithTitleProps = {
  icon: JSX.Element,
  count?: number,
  label?: string
}

export const IconWithLabel = ({ icon, label, count = 0 }: IconWithTitleProps) => {
  const countStr = count > 0
    ? count.toString()
    : undefined

  const text = label
    ? label + (countStr ? ` (${countStr})` : '')
    : countStr

  return <>
    {icon}
    {text && <span className='ml-2'>{text}</span>}
  </>
}
