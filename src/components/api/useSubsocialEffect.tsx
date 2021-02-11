import { useEffect, DependencyList, useMemo } from 'react'
import { SubsocialConsts, useSubsocialApi } from '../utils/SubsocialApiContext'
import { isFunction } from '@polkadot/util'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { SubsocialIpfsApi } from '@subsocial/api/ipfs'

type Apis = {
  subsocial: SubsocialApi
  substrate: SubsocialSubstrateApi
  ipfs: SubsocialIpfsApi
  consts: SubsocialConsts
}

type EffectCallbackResult = void | (() => void | undefined)
type EffectCallback = (apis: Apis) => EffectCallbackResult

/** Effect callback will be called only if API is ready. */
export default function useSubsocialEffect (
  effect: EffectCallback,
  deps: DependencyList = []
): void {

  const _deps = useMemo(() => JSON.stringify(deps), deps)
  const apis = useSubsocialApi()
  const isReady = apis.isApiReady

  // console.log('useSubsocialEffect: deps:', _deps)

  useEffect(() => {
    if (isReady && isFunction(effect)) {
      // At this point all APIs should be initialized and ready to use.
      // That's why we can treat them as defined here and cast to their types.
      return effect({
        subsocial: apis.subsocial as SubsocialApi,
        substrate: apis.substrate as SubsocialSubstrateApi,
        ipfs: apis.ipfs as SubsocialIpfsApi,
        consts: apis.consts
      })
    }
  }, [ isReady, _deps ])
}
