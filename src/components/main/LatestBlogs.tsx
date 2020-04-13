import React from 'react';
import { Button } from 'antd';
import { Blog } from '@subsocial/types/substrate/interfaces';
import ListData from '../utils/DataList';
import { ViewBlogPage } from '../blogs/ViewBlog';
import { BlogData } from '@subsocial/types/dto';

type Props = {
  blogsData: BlogData[]
}

export const LatestBlogs = (props: Props) => {
  const { blogsData = [] } = props
  const blogs = blogsData.filter((x) => typeof x.struct !== 'undefined')

  return <ListData
    title={`Latest blogs`}
    dataSource={blogs}
    noDataDesc='No blogs created yet'
    noDataExt={<Button href='/blogs/new'>Create blog</Button>}
    renderItem={(item) =>
      <ViewBlogPage
        {...props}
        key={(item.struct as Blog).id.toString()}
        blogData={item}
        previewDetails
        withFollowButton
      />
    }
  />
}
