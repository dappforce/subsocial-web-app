import { useEffect, DependencyList } from 'react';
import { useSubsocialApi, SubsocialApiState } from '../utils/SubsocialApiContext';
import { isFunction } from '@polkadot/util';

type SubsocialEffectCallback =
  (apis: SubsocialApiState) => (void | (() => void | undefined))

export default function useSubsocialEffect (
  effect: SubsocialEffectCallback,
  deps: DependencyList = []
): void {
  const apis = useSubsocialApi()
  const isReady = apis.isApiReady

  useEffect(() => {
    if (isReady && isFunction(effect)) {
      return effect(apis)
    }
  }, [ isReady, ...deps ])
}
