import React from 'react'

import { ViewSpace } from './ViewSpace'
import { useRouter } from 'next/router'
import BN from 'bn.js'

const Component = () => {
  const router = useRouter()
  const { spaceId } = router.query
  return spaceId
    ? <ViewSpace id={new BN(spaceId as string)} />
    : null
}

export default Component
