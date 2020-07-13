import React from 'react'
import { TxButton, TxButtonProps } from './SubstrateTxButton'

const Div: React.FunctionComponent = (props) => <div {...props} >{props.children}</div>

export const TxDiv = (props: TxButtonProps) => <TxButton component={Div} {...props} />

export default React.memo(TxDiv)
