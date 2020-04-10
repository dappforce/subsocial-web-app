import React, { useEffect, useState } from 'react'
import { Select } from 'antd';
import { LabeledValue } from 'antd/lib/select';
import NoData from './EmptyList';
import { getApi } from './SubstrateApi';
import { loadBlogData, BlogData } from '../blogs/ViewBlog';
import { DfBgImg } from './DfBgImg';
import { nonEmptyStr } from './index'
import BN from 'bn.js'
import { IdentityIcon } from '@polkadot/react-components';
import { BlogId } from '@subsocial/types/substrate/interfaces';
import { BlogContent } from '@subsocial/types/offchain';

type Props = {
  imageSize?: number,
  blogIds: BN[],
  onSelect?: (value: string | number | LabeledValue) => void,
  defaultValue?: string,
  preparedBlogsData?: {
    name: string,
    image: string,
    hasImage: boolean,
    id: string | undefined
  }[] | undefined
};

const SUB_SIZE = 2;

const SelectBlogPreview = (props: Props) => {
  const { preparedBlogsData, imageSize = 36, onSelect, defaultValue } = props

  if (!preparedBlogsData) return <NoData description={<span>Blogs not found</span>} />;

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

    if (!blogIds) return <NoData description={<span>No blogs found</span>} />

    const [ currentBlogsData, setCurrentBlogsData ] = useState<BlogData[]>()

    useEffect(() => {
      const loadBlogs = async () => {
        const { blogIds } = props
        if (!blogIds) return

        const api = await getApi();

        // console.log('blogIds from getInitialProps Select', blogIds)

        const loadBlogs = blogIds.map(id => loadBlogData(api, id as BlogId));
        const blogsData = await Promise.all<BlogData>(loadBlogs);

        // console.log('blogsData from Select Effect:', blogsData)

        setCurrentBlogsData(blogsData)
      }

      loadBlogs();
    }, [ blogIds ])

    const preparedBlogsData = currentBlogsData?.map((x) => {
      const { initialContent } = x
      const { name, image } = initialContent as BlogContent
      const hasImage = nonEmptyStr(image)
      return {
        id: x.blog?.id.toString(),
        name,
        image,
        hasImage
      }
    })

    if (!preparedBlogsData) return <NoData description={<span>No blogs found</span>} />

    return <Component preparedBlogsData={preparedBlogsData} {...props} />
  }
}

export default GetBlogData(SelectBlogPreview)
