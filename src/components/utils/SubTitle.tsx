import React from 'react'

type Props = {
  title: React.ReactNode
  className?: string
}

export const SubTitle = ({ title, className }: Props) => (
  <div className={`text-left DfSubTitle ${className}`}>{title}</div>
)

export default SubTitle;
