import React from 'react'
import { TxButtonProps } from './SubstrateTxButton'
import TxButton from 'src/components/utils/TxButton'

const Div: React.FunctionComponent = (props) =>
  <div {...props} >{props.children}</div>

export const TxDiv = (props: TxButtonProps) =>
  <TxButton component={Div} {...props} />

export default React.memo(TxDiv)
