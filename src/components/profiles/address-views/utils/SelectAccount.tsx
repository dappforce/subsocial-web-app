import React from 'react'
import InputAddress from '../../../utils/InputAddress';
import { u32 } from '@polkadot/types'
import BN from 'bn.js'
import { ZERO } from '../../../utils';

type Props = {
  reputation: BN | u32 | string | number
}

export const SelectAccount: React.FunctionComponent<Props> = ({ reputation = ZERO }) => {
  return <div className='DfSelectAccount'>
    <div className='DfProfileInfo'>
        My reputation: {reputation.toString()}
    </div>
    <InputAddress
      className='DfTopBar--InputAddress' // FIXME dropdown in  popup
      type='account'
      withLabel={false}
    />
  </div>;
}

export default SelectAccount;
