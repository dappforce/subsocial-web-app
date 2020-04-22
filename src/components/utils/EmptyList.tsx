import React from 'react'
import { Empty } from 'antd'
import { MutedSpan } from './MutedText'

type Props = {
  image?: string
  description?: React.ReactNode | string
  children?: React.ReactNode
}

// TODO rename to 'EmptyList'
export const NoData = (props: Props) =>
  <Empty
    className='DfEmpty'
    image={props.image}
    description={
      <MutedSpan>{props.description}</MutedSpan>
    }
  >
    {props.children}
  </Empty>

export default NoData
