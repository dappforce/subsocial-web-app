import AccountId from '@polkadot/types/ethereum/AccountId'
import { SubstrateId } from '@subsocial/types'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { FetchManyResult } from 'src/rtk/app/hooksCommon'
import { AnyId } from 'src/types'

type FetchSubstrateProps = {
  pallet: string,
  method: string,
  id: AnyId
}

export const useGetSubstrateIdsById = <T extends SubstrateId | AccountId = SubstrateId>
  ({ method, pallet, id }: FetchSubstrateProps): FetchManyResult<T> => {
    const [ entities, setEntities ] = useState<T[]>([])
    const [ loading, setLoading ] = useState(false)
  
    useSubsocialEffect(({ substrate }) => {
      let isMounted = true

      const load = async () => {
        setLoading(true)
        const readyApi = await substrate.api
  
        const ids = await readyApi.query[pallet][method](id)
  
        if (isMounted) {
          setEntities(ids as unknown as T[])
          setLoading(false)
        }
      }
      load()

      return () => { isMounted = false }
    }, [ id?.toString() ])
  
    return {
      loading,
      entities
    }
}
