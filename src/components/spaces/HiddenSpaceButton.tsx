import React from 'react'
import HiddenButton from '../utils/HiddenButton'
import { SpaceUpdate, OptionOptionText, OptionIpfsContent, OptionBool } from '@subsocial/types/substrate/classes'
import { SpaceStruct } from 'src/types'

type HiddenSpaceButtonProps = {
  space: SpaceStruct
  asLink?: boolean
}

export function HiddenSpaceButton (props: HiddenSpaceButtonProps) {
  const { space } = props
  const { hidden } = space

  const newTxParams = () => {
    const update = new SpaceUpdate({
      handle: new OptionOptionText(),
      content: new OptionIpfsContent(),
      hidden: new OptionBool(!hidden) // TODO has no implementation on UI
    })
    return [ space.id, update ]
  }

  return <HiddenButton type='space' newTxParams={newTxParams} struct={space} {...props} />
}

export default HiddenSpaceButton
