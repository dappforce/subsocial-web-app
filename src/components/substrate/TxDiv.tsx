import React from 'react'
import { TxButtonProps } from './SubstrateTxButton'
import TxButton from 'src/components/utils/TxButton'

const Div: React.FunctionComponent = (props) => <div {...props} >{props.children}</div>

export const TxDiv = ({ loading, withSpinner, ghost, ...divProps }: TxButtonProps) => <TxButton component={Div} {...divProps} />

export default React.memo(TxDiv)
