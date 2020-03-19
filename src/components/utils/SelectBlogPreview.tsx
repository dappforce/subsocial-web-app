import React, { useEffect, useState } from 'react'
import { BlogId, BlogContent } from '../types';
import { Select } from 'antd';
import { LabeledValue } from 'antd/lib/select';
import { NoData } from './DataList';
import { getApi } from './SubstrateApi';
import { loadBlogData, BlogData } from '../blogs/ViewBlog';
import { DfBgImg } from './DfBgImg';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';
import { nonEmptyStr } from './index'

type Props = {
  imageSize?: number,
  blogIds: BlogId[],
  onSelect?: (value: string | number | LabeledValue) => void,
  defaultValue?: string
};

const SUB_SIZE = 2;

const SelectBlogPreview = (props: Props) => {
  const { blogIds, imageSize = 36, onSelect, defaultValue } = props

  if (!blogIds) return <NoData description={<span>Blogs not found</span>} />;

  const [ currentBlogsData, setCurrentBlogsData ] = useState<BlogData[]>()

  console.log('blogIds from SelectBlogPreview', blogIds)

  useEffect(() => {
    const loadBlogs = async () => {
      const { blogIds } = props
      if (!blogIds) return

      const api = await getApi();

      console.log('blogIds from getInitialProps Select', blogIds)

      const loadBlogs = blogIds.map(id => loadBlogData(api, id as BlogId));
      const blogsData = await Promise.all<BlogData>(loadBlogs);

      console.log('blogsData from Select Effect:', blogsData)

      setCurrentBlogsData(blogsData)
    }

    loadBlogs();
  }, [ blogIds ])

  return <Select
    style={{ width: 200 }}
    onSelect={onSelect}
    defaultValue={defaultValue}
  >
    { currentBlogsData && currentBlogsData.map((x) => {
      const { initialContent } = x
      const { name, image } = initialContent as BlogContent
      const hasImage = image && nonEmptyStr(image)

      return (
        <Select.Option value={x.blog?.id.toString()} key={x.blog?.id.toString()}>
          <div className={`item ProfileDetails DfPreview`}>
            {hasImage
              ? <DfBgImg className='DfAvatar' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
              : <IdentityIcon className='image' size={imageSize - SUB_SIZE} />
            }
            <div className='content'>
              <div className='handle'>{name}</div>
            </div>
          </div>
        </Select.Option>
      )
    })
    }
  </Select>
}

export default SelectBlogPreview
