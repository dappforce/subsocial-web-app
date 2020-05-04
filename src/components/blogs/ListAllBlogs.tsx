import React from 'react';
import { ViewBlogPage } from './ViewBlog';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import BN from 'bn.js';
import { ZERO, ONE } from '../utils';
import { BlogData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';

type Props = {
  totalCount?: BN
  blogsData?: BlogData[]
}

export const ListAllBlogs: NextPage<Props> = (props) => {
  const { totalCount = ZERO, blogsData = [] } = props
  const title = `Explore Blogs (${totalCount})`

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title={title} desc='Find interesting blogs on Subsocial and follow them.' />
      <ListData
        title={title}
        dataSource={blogsData}
        noDataDesc='There are no blogs yet'
        noDataExt={<Button href='/blogs/new'>Create blog</Button>}
        renderItem={(item) =>
          <ViewBlogPage
            key={item.struct.id.toString()}
            {...props}
            blogData={item}
            previewDetails
            withFollowButton
          />
        }
      />
    </div>
  )
}

const firstBlogId = ONE

// TODO add pagination

ListAllBlogs.getInitialProps = async (_props): Promise<Props> => {
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial

  const nextBlogId = await substrate.nextBlogId()
  const totalCount = nextBlogId.sub(firstBlogId)
  let blogsData: BlogData[] = []

  if (totalCount.gt(ZERO)) {
    const blogIds: BN[] = []
    for (let id = totalCount; id.gte(firstBlogId); id = id.sub(ONE)) {
      blogIds.push(id)
    }
    blogsData = await subsocial.findBlogs(blogIds)
  }

  return {
    totalCount,
    blogsData
  }
}

export default ListAllBlogs
