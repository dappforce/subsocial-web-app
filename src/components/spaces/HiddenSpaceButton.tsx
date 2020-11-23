import React from 'react'
import { Space } from '@subsocial/types/substrate/interfaces'
import HiddenButton from '../utils/HiddenButton'
import { SpaceUpdate, OptionOptionText, OptionIpfsContent, OptionBool } from '@subsocial/types/substrate/classes'

type HiddenSpaceButtonProps = {
  space: Space,
  asLink?: boolean
};

export function HiddenSpaceButton (props: HiddenSpaceButtonProps) {
  const { space } = props
  const hidden = space.hidden.valueOf()

  const update = new SpaceUpdate({
    handle: new OptionOptionText(),
    content: new OptionIpfsContent(),
    hidden: new OptionBool(!hidden) // TODO has no implementation on UI
  })

  const newTxParams = () => {
    return [ space.id, update ]
  }

  return <HiddenButton type='space' newTxParams={newTxParams} struct={space} {...props} />
}

export default HiddenSpaceButton
