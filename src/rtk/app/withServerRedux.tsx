import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { AppDispatch, HasInitialReduxState, initializeStore } from 'src/rtk/app/store'
import { SubsocialApi } from '@subsocial/api/subsocial'

type CbArgs = {
  dispatch: AppDispatch
  subsocial: SubsocialApi
}

type CbFn<Result extends {}> = (props: CbArgs) => Promise<Result>

export async function withServerRedux
  <ResultProps extends {} = {}>
  (cb?: CbFn<ResultProps>):
  Promise<HasInitialReduxState & ResultProps>
{
  const reduxStore = initializeStore()
  let props = {} as ResultProps

  if (typeof cb === 'function') {
    const { dispatch } = reduxStore
    const subsocial = await getSubsocialApi()
    props = await cb({ dispatch, subsocial })
  }

  return {
    initialReduxState: reduxStore.getState(),
    ...props
  }
}
