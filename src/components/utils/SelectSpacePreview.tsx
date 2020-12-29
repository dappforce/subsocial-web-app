/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { Select } from 'antd'
import { LabeledValue } from 'antd/lib/select'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { isEmptyArray } from '@subsocial/utils'
import { SpaceData, SpaceId } from 'src/types'
import { SpaceAvatar } from '../spaces/helpers'

type Props = {
  imageSize?: number,
  spaceIds: SpaceId[],
  onSelect?: (value: string | number | LabeledValue) => void,
  defaultValue?: string,
  spacesData?: SpaceData[]
}

const SelectSpacePreview = (props: Props) => {
  const { spacesData = [], onSelect, defaultValue, imageSize } = props

  if (isEmptyArray(spacesData)) return null

  return <Select
    style={{ width: 250 }}  
    onSelect={onSelect}
    defaultValue={defaultValue}
  >
    {spacesData.map(({ struct, content }) => {
      if (!content) return null

      const { id, ownerId } = struct
      const { image, name } = content

      const idStr = id.toString()

      return <Select.Option value={idStr} key={idStr}>
        <div className={'ProfileDetails DfPreview'}>
          <SpaceAvatar address={ownerId} space={struct} avatar={image} size={imageSize} asLink={false} />
          <div className='content'>
            <div className='handle'>{name}</div>
          </div>
        </div>
      </Select.Option>
    })}
  </Select>
}

const GetSpaceData = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { spaceIds } = props
    const [ currentSpacesData, setCurrentSpacesData ] = useState<SpaceData[]>([])

    useSubsocialEffect(({ flatApi }) => {
      let isMounted = true

      const loadSpaces = async () => {
        // TODO use redux
        const spacesData = await flatApi.findPublicSpaces(spaceIds)
        isMounted && setCurrentSpacesData(spacesData)
      }

      loadSpaces()

      return () => { isMounted = false }
    }, [ spaceIds ])

    if (isEmptyArray(spaceIds)) return null

    if (!currentSpacesData) return null

    return <Component spacesData={currentSpacesData} {...props} />
  }
}

export default GetSpaceData(SelectSpacePreview)
