import React, { FC } from 'react'
import { BareProps } from './types'

export const Segment: FC<BareProps> = ({ children, style, className }) =>
  <div
    className={`DfSegment ${className}`}
    style={style}
  >
    {children}
  </div>

export default Segment
