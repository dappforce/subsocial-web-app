import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { AppDispatch, AppStore, initializeStore } from 'src/rtk/app/store'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { NextComponentType, NextPageContext } from 'next'

type CbArgs = {
  context: NextPageContext
  subsocial: SubsocialApi
  dispatch: AppDispatch
  reduxStore: AppStore
}

type CbFn<Result extends {}> = (props: CbArgs) => Promise<Result>

export const withServerRedux = async <ResultProps extends {} = {}> (
  component: NextComponentType<NextPageContext, ResultProps>,
  cb?: CbFn<ResultProps>
) =>
  component.getInitialProps = async (context: NextPageContext) => {
    const reduxStore = initializeStore()
    let resultProps = {} as ResultProps

    if (typeof cb === 'function') {
      const { dispatch } = reduxStore
      const subsocial = await getSubsocialApi()
      resultProps = await cb({ context, subsocial, dispatch, reduxStore })
    }

    return {
      initialReduxState: reduxStore.getState(),
      ...resultProps
    }
  }
