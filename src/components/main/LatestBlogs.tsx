import React from 'react';
import { Button } from 'antd';
import { Blog } from '@subsocial/types/substrate/interfaces';
import ListData from '../utils/DataList';
import { BlogData, ViewBlogPage } from '../blogs/ViewBlog';

type Props = {
  blogsData: BlogData[]
}

export const LatestBlogs = (props: Props) => {
  const { blogsData = [] } = props
  const blogs = blogsData.filter((x) => typeof x.blog !== 'undefined')

  return <ListData
    title={`Latest blogs`}
    dataSource={blogs}
    noDataDesc='No blogs created yet'
    noDataExt={<Button href='/blogs/new'>Create blog</Button>}
    renderItem={(item) =>
      <ViewBlogPage
        {...props}
        key={(item.blog as Blog).id.toString()}
        blogData={item}
        previewDetails
        withFollowButton
      />
    }
  />
}
