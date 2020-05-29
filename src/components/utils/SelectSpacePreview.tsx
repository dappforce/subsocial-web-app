import React, { useEffect, useState } from 'react'
import { Select } from 'antd';
import { LabeledValue } from 'antd/lib/select';
import { DfBgImg } from './DfBgImg';
import BN from 'bn.js'
import { IdentityIcon } from '@subsocial/react-components';
import { useSubsocialApi } from './SubsocialApiContext';
import { isEmptyArray, nonEmptyStr } from '@subsocial/utils';
import { SpaceData } from '@subsocial/types/dto';
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config';

type PreparedSpaceData = {
  name: string,
  image: string,
  hasImage: boolean,
  id?: string
}

type Props = {
  imageSize?: number,
  spaceIds: BN[],
  onSelect?: (value: string | number | LabeledValue) => void,
  defaultValue?: string,
  preparedSpacesData?: PreparedSpaceData[]
};

const SUB_SIZE = 2;

const SelectSpacePreview = (props: Props) => {
  const { preparedSpacesData = [], imageSize = DEFAULT_AVATAR_SIZE, onSelect, defaultValue } = props

  if (isEmptyArray(preparedSpacesData)) return null

  return <Select
    style={{ width: 200 }}
    onSelect={onSelect}
    defaultValue={defaultValue}
  >
    {preparedSpacesData.map((x) =>
      <Select.Option value={x.id} key={x.id}>
        <div className={`ProfileDetails DfPreview`}>
          {x.hasImage
            ? <DfBgImg className='DfAvatar' size={imageSize} src={x.image} style={{ border: '1px solid #ddd' }} rounded/>
            : <IdentityIcon className='image' size={imageSize - SUB_SIZE} />
          }
          <div className='content'>
            <div className='handle'>{x.name}</div>
          </div>
        </div>
      </Select.Option>
    )}
  </Select>
}

const GetSpaceData = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { spaceIds } = props

    if (isEmptyArray(spaceIds)) return null

    const { subsocial } = useSubsocialApi()
    const [ currentSpacesData, setCurrentSpacesData ] = useState<SpaceData[]>([])

    useEffect(() => {
      const loadSpaces = async () => {
        const spacesData = await subsocial.findSpaces(spaceIds)
        setCurrentSpacesData(spacesData)
      }

      loadSpaces();
    }, [ spaceIds ])

    const preparedSpacesData = currentSpacesData.map((x) => {
      const { struct, content } = x
      if (!struct || !content) return undefined;

      const { name, image } = content
      const hasImage = nonEmptyStr(image)
      return {
        id: struct?.id.toString(),
        name,
        image,
        hasImage
      }
    }).filter(x => typeof x !== 'undefined') as PreparedSpaceData[]

    if (!preparedSpacesData) return null

    return <Component preparedSpacesData={preparedSpacesData} {...props} />
  }
}

export default GetSpaceData(SelectSpacePreview)
