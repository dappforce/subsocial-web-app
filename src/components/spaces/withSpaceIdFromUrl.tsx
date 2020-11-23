import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import BN from 'bn.js'
import { getSpaceId } from '../substrate'
import NoData from '../utils/EmptyList'

export function withSpaceIdFromUrl<Props = { spaceId: SpaceId }>
  (Component: React.ComponentType<Props>) {

  return function (props: Props) {
    const router = useRouter()
    const { spaceId } = router.query
    const idOrHandle = spaceId as string
    try {
      const [ id, setId ] = useState<BN>()

      useEffect(() => {
        const getId = async () => {
          const id = await getSpaceId(idOrHandle)
          id && setId(id)
        }
        getId().catch(err => console.error(err))
      }, [ false ])

      return !id ? null : <Component spaceId={id} {...props} />
    } catch (err) {
      return <NoData description={`Invalid space ID or handle: ${idOrHandle}`}/>
    }
  }
}
