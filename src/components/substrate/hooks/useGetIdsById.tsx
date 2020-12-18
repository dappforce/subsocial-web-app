import AccountId from '@polkadot/types/ethereum/AccountId'
import { SubstrateId } from '@subsocial/types'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { FetchManyResult } from 'src/rtk/app/hooksCommon'
import { AnyId } from 'src/types'

type FetchSubstrateProps = {
  method: string,
  pallete: string,
  id: AnyId
}

export const useGetSubstrateIdsById = <T extends SubstrateId | AccountId = SubstrateId>
  ({ method, pallete, id }: FetchSubstrateProps): FetchManyResult<T> => {
    const [ reactionIds, setReactionIds ] = useState<T[]>([])
    const [ loading, setLoading ] = useState(false)
  
    useSubsocialEffect(({ substrate }) => {
      const loadReactionIds = async () => {
        setLoading(true)
        const readyApi = await substrate.api
  
        const ids = await readyApi.query[pallete][method](id)
  
        setReactionIds(ids as unknown as T[])
        setLoading(false)
      }
      loadReactionIds()
    }, [ id ])
  
    return {
      loading,
      entities: reactionIds
    }
}
