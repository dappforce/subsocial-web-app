import React, { useState, useEffect } from 'react';
import { Loader } from 'semantic-ui-react'
import { ViewBlogPage } from './ViewBlog';
import ListData from '../utils/DataList';
import { Button, Pagination } from 'antd';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import BN from 'bn.js';
import { BlogData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import InfiniteScroll from 'react-infinite-scroll-component';
import { INFINITE_SCROLL_PAGE_SIZE } from 'src/config/ListData.config';

type Props = {
  totalCount: number;
  blogsData: BlogData[];
};

export const ListAllBlogs: NextPage<Props> = (props: Props) => {
  const { blogsData } = props;

  const [ items, setItems ] = useState<any[]>([]);
  const [ offset, setOffset ] = useState(0);
  const [ hasMore, setHasMore ] = useState(true);
  const [ currentPage, setCurrentPage ] = useState(0)
  const [ hidePagination, setHidePagination ] = useState(false)

  const getNextPage = async (actualOffset: number = offset) => {
    const isFirstPage = actualOffset === 0;
    const data = blogsData.slice(actualOffset, INFINITE_SCROLL_PAGE_SIZE + actualOffset);

    if (data.length < INFINITE_SCROLL_PAGE_SIZE) setHasMore(false);

    setItems(isFirstPage ? data : items.concat(data));
    setOffset(actualOffset + INFINITE_SCROLL_PAGE_SIZE);
    setCurrentPage(currentPage + 1)
    setHidePagination(true)
  };

  useEffect(() => {
    getNextPage()
  }, [])

  const totalCount = items && items.length;

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title='All blogs' desc='Subsocial blogs' />
      <InfiniteScroll
        dataLength={totalCount}
        next={getNextPage}
        hasMore={hasMore}
        loader={<Loader active inline='centered' />}
      >
        {items && items.length > 0
          ? items.map((item, index) => <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton />)
          : <Button href='/blogs/new'>Create blog</Button>}
        {!hidePagination &&
          <Pagination current={currentPage} pageSize={INFINITE_SCROLL_PAGE_SIZE} total={blogsData.length} />}
      </InfiniteScroll>
    </div>
  );
};

ListAllBlogs.getInitialProps = async (props): Promise<any> => {
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const nextBlogId = await substrate.nextBlogId()

  const firstBlogId = new BN(1);
  const totalCount = nextBlogId.sub(firstBlogId).toNumber();
  let blogsData: BlogData[] = [];

  if (totalCount > 0) {
    const firstId = firstBlogId.toNumber();
    const lastId = nextBlogId.toNumber();
    const blogIds: BN[] = [];
    for (let i = firstId; i < lastId; i++) {
      blogIds.push(new BN(i));
    }
    blogsData = await subsocial.findBlogs(blogIds);
  }

  return {
    totalCount,
    blogsData
  };
};

type MyBlogProps = {
  blogsData: BlogData[];
};

export const ListMyBlogs: NextPage<MyBlogProps> = (props: MyBlogProps) => {
  const { blogsData } = props;
  const totalCount = blogsData.length;
  return (<>
    <HeadMeta title='My blogs' desc='Subsocial blogs' />
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
  );
};

ListMyBlogs.getInitialProps = async (props): Promise<MyBlogProps> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const myBlogIds = await substrate.blogIdsByOwner(address as string)
  const blogsData = await subsocial.findBlogs(myBlogIds);
  return {
    blogsData
  }
}
