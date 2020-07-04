import { useContext } from 'react'
import { SubstrateContext, State, Dispatch } from './SubstrateContext'

export const useSubstrate = (): State & { dispatch: Dispatch } => {
  const [ state, dispatch ] = useContext(SubstrateContext)
  return { ...state, dispatch }
}

export default useSubstrate
