import React from 'react'

type Props = {
  title: React.ReactNode
  className?: string
}

export const SubTitle = ({ title, className }: Props) => (
  <div className={`text-left DfSubTitle my-2 ${className}`}>{title}</div>
)

export default SubTitle;
