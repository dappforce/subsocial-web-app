import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import BN from 'bn.js'
import { getSpaceId } from '../substrate'
import { newLogger } from '@subsocial/utils'

const log = newLogger(withSpaceIdFromUrl.name)

export function withSpaceIdFromUrl
  <Props = { spaceId: SpaceId }>
  (Component: React.ComponentType<Props>)
{
  return function (props: Props) {
    const router = useRouter()
    const [ id, setId ] = useState<BN>()
    const idOrHandle = router.query.spaceId as string

    useEffect(() => {
      let isMounted = true

      getSpaceId(idOrHandle)
        .then(res => isMounted && res && setId(res))
        .catch(err => log.error('Failed to resolve space id by handle from URL', err))

      return () => { isMounted = false }
    }, [ idOrHandle ])

    if (!id) return null

    return <Component spaceId={id} {...props} />
  }
}
