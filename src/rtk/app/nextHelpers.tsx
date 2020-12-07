import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { AppDispatch, AppStore, initializeStore } from 'src/rtk/app/store'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { NextComponentType, NextPageContext } from 'next'
import { FlatSubsocialApi, newFlatApi } from 'src/components/substrate'

export type NextContextWithRedux = {
  context: NextPageContext
  subsocial: SubsocialApi
  flatApi: FlatSubsocialApi
  dispatch: AppDispatch
  reduxStore: AppStore
}

type CbFn<Result extends {}> = (props: NextContextWithRedux) => Promise<Result>

export const getInitialPropsWithRedux = async <ResultProps extends {} = {}> (
  component: NextComponentType<NextPageContext, ResultProps, ResultProps>,
  cb?: CbFn<ResultProps>
) =>
  component.getInitialProps = async (context: NextPageContext) => {
    const reduxStore = initializeStore()
    let resultProps = {} as ResultProps

    if (typeof cb === 'function') {
      const { dispatch } = reduxStore
      const subsocial = await getSubsocialApi()
      const flatApi = newFlatApi(subsocial)
      resultProps = await cb({ context, subsocial, flatApi, dispatch, reduxStore })
    }

    return {
      initialReduxState: reduxStore.getState(),
      ...resultProps
    }
  }
