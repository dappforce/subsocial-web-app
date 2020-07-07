import React from 'react'
import { BareProps } from './types'

export const Segment: React.FunctionComponent<BareProps> =
    ({ children, style, className }) =>
      <div
        className={`DfSegment ${className}`}
        style={style}>
        {children}
      </div>

export default Segment
