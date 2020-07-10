import { useEffect, DependencyList } from 'react'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { isFunction } from '@polkadot/util'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { SubsocialIpfsApi } from '@subsocial/api/ipfs'

type Apis = {
  subsocial: SubsocialApi
  substrate: SubsocialSubstrateApi
  ipfs: SubsocialIpfsApi
}

type EffectCallback =
  (apis: Apis) => (void | (() => void | undefined))

/** Effect callback will be called only if API is ready. */
export default function useSubsocialEffect (
  effect: EffectCallback,
  deps: DependencyList = []
): void {
  const apis = useSubsocialApi()
  const isReady = apis.isApiReady

  useEffect(() => {
    if (isReady && isFunction(effect)) {
      // At this point all APIs should be initialized and ready to use.
      // That's why we can treat them as defined here and cast to their types.
      return effect({
        subsocial: apis.subsocial as SubsocialApi,
        substrate: apis.substrate as SubsocialSubstrateApi,
        ipfs: apis.ipfs as SubsocialIpfsApi
      })
    }
  }, [ isReady, ...deps ])
}
