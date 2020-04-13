import React, { useEffect, useState } from 'react'
import { Select } from 'antd';
import { LabeledValue } from 'antd/lib/select';
import NoData from './EmptyList';
import { DfBgImg } from './DfBgImg';
import BN from 'bn.js'
import { IdentityIcon } from '@polkadot/react-components';
import { useSubsocialApi } from './SubsocialApiContext';
import { isEmptyArray, nonEmptyStr } from '@subsocial/utils';
import { BlogData } from '@subsocial/types/dto';

type PreparedBlogData = {
  name: string,
  image: string,
  hasImage: boolean,
  id: string | undefined
}

type Props = {
  imageSize?: number,
  blogIds: BN[],
  onSelect?: (value: string | number | LabeledValue) => void,
  defaultValue?: string,
  preparedBlogsData?: PreparedBlogData[]
};

const SUB_SIZE = 2;

const SelectBlogPreview = (props: Props) => {
  const { preparedBlogsData = [], imageSize = 36, onSelect, defaultValue } = props

  if (isEmptyArray(preparedBlogsData)) return <NoData description={<span>Blogs not found</span>} />;

  return <Select
    style={{ width: 200 }}
    onSelect={onSelect}
    defaultValue={defaultValue}
  >
    { preparedBlogsData.map((x) => (
      <Select.Option value={x.id} key={x.id}>
        <div className={`item ProfileDetails DfPreview`}>
          {x.hasImage
            ? <DfBgImg className='DfAvatar' size={imageSize} src={x.image} style={{ border: '1px solid #ddd' }} rounded/>
            : <IdentityIcon className='image' size={imageSize - SUB_SIZE} />
          }
          <div className='content'>
            <div className='handle'>{x.name}</div>
          </div>
        </div>
      </Select.Option>
    )
    )}
  </Select>
}

const GetBlogData = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { blogIds } = props

    if (isEmptyArray(blogIds)) return <NoData description={<span>No blogs found</span>} />

    const { subsocial } = useSubsocialApi()
    const [ currentBlogsData, setCurrentBlogsData ] = useState<BlogData[]>([])

    useEffect(() => {
      const loadBlogs = async () => {
        const blogsData = await subsocial.findBlogs(blogIds)
        setCurrentBlogsData(blogsData)
      }

      loadBlogs();
    }, [ blogIds ])

    const preparedBlogsData = currentBlogsData.map((x) => {
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
    }).filter(x => typeof x !== 'undefined') as PreparedBlogData[]

    if (!preparedBlogsData) return <NoData description={<span>No blogs found</span>} />

    return <Component preparedBlogsData={preparedBlogsData} {...props} />
  }
}

export default GetBlogData(SelectBlogPreview)
