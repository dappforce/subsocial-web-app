import { SpaceData } from 'src/types'
import { AnyAccountId } from '@subsocial/types/substrate'
import { isEmptyStr } from '@subsocial/utils'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import { getSpaceId } from 'src/components/substrate'

export const useLoadUnlistedSpace = (address: AnyAccountId) => {
  const isMySpace = isMyAddress(address)
  const { query: { spaceId } } = useRouter()
  const idOrHandle = spaceId as string

  const [ myHiddenSpace, setMyHiddenSpace ] = useState<SpaceData>()

  useSubsocialEffect(({ subsocial }) => {
    if (!isMySpace || isEmptyStr(idOrHandle)) return

    let isSubscribe = true

    const loadSpaceFromId = async () => {
      const id = await getSpaceId(idOrHandle, subsocial)
      const spaceData = id && await subsocial.findSpace({ id })
      isSubscribe && spaceData && setMyHiddenSpace(spaceData)
    }

    loadSpaceFromId()

    return () => { isSubscribe = false }
  }, [ isMySpace ])

  return {
    isLoading: !myHiddenSpace,
    myHiddenSpace
  }
}
