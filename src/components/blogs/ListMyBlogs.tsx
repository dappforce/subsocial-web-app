import React from 'react';
import { ViewBlogPage } from './ViewBlog';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { BlogData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';

type Props = {
  blogsData: BlogData[];
};

export const ListMyBlogs: NextPage<Props> = (props) => {
  const { blogsData } = props;
  const totalCount = blogsData.length;

  return <>
    <HeadMeta title='My blogs' desc='The blogs I manage on Subsocial' />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={`My Blogs (${totalCount})`}
        dataSource={blogsData}
        renderItem={(item, index) => <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton />}
        noDataDesc='You do not have your own blogs yet'
        noDataExt={<Button href='/blogs/new'>Create my first blog</Button>}
      />
    </div>
  </>
};

ListMyBlogs.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const myBlogIds = await substrate.blogIdsByOwner(address as string)
  const blogsData = await subsocial.findBlogs(myBlogIds);

  return {
    blogsData
  }
}

export default ListMyBlogs
