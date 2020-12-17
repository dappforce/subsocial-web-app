import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getSpaceId } from '../substrate'
import { SpaceData } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'
import { isFunction } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'

type CheckPermissionResult = {
  ok: boolean
  error: (space: SpaceData) => JSX.Element
}

export type CheckSpacePermissionFn = (space: SpaceData) => CheckPermissionResult

type CheckSpacePermissionProps = {
  checkSpacePermission?: CheckSpacePermissionFn
}

export type CanHaveSpaceProps = {
  space?: SpaceData
}

const log = newLogger(withLoadSpaceFromUrl.name)

export function withLoadSpaceFromUrl<Props extends CanHaveSpaceProps> (
  Component: React.ComponentType<Props>
) {
  return function (props: Props & CheckSpacePermissionProps): React.ReactElement<Props> {

    const { checkSpacePermission } = props
    const idOrHandle = useRouter().query.spaceId as string
    const [ isLoaded, setIsLoaded ] = useState(false)
    const [ loadedData, setLoadedData ] = useState<CanHaveSpaceProps>({})

    useSubsocialEffect(({ flatApi, subsocial }) => {
      let isMounted = true

      const load = async () => {
        const id = await getSpaceId(idOrHandle, subsocial)
        if (!isMounted || !id) return

        setIsLoaded(false)
        const space = await flatApi.findSpace({ id })
        if (!isMounted) return

        setLoadedData({ space })
        setIsLoaded(true)
      }

      load().catch(err => log.error(
        'Failed to load a space by id or handle from URL:', idOrHandle, err
      ))

      return () => { isMounted = false }
    }, [ idOrHandle ])

    if (!isLoaded) return <Loading label='Loading the space...' />

    const { space } = loadedData
    if (!space) return <NoData description='Space not found' />

    if (isFunction(checkSpacePermission)) {
      const { ok, error } = checkSpacePermission(space)
      if (!ok) return error(space)
    }

    return <Component {...props} space={space} />
  }
}
