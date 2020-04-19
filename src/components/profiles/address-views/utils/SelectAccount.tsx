import React from 'react'
import InputAddress from '../../../utils/InputAddress';
import { u32 } from '@polkadot/types'
import BN from 'bn.js'

type Props = {
  reputation: BN | u32 | string | number
}

export const SelectAccount: React.FunctionComponent<Props> = ({ reputation }) => {
  return <div className='addressPreview'>
    <div className='profileInfo'>
      <div className='profileDesc'>
          My reputation: {reputation.toString()}
      </div>
    </div>
    <InputAddress
      className='DfTopBar--InputAddress' // FIXME dropdown in  popup
      type='account'
      withLabel={false}
    />
  </div>;
}

export default SelectAccount;
