import { BlogContent } from '@subsocial/types/offchain';
import { nonEmptyStr } from '@subsocial/utils';
import BN from 'bn.js';
import mdToText from 'markdown-to-txt';
import { NextPage } from 'next';
import Error from 'next/error';
import React, { useState } from 'react';
import { isBrowser } from 'react-device-detect';

import { AuthorPreview } from '../profiles/address-views';
import { DfMd } from '../utils/DfMd';
import NoData from '../utils/EmptyList';
import { HeadMeta } from '../utils/HeadMeta';
import { return404 } from '../utils/next';
import Section from '../utils/Section';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { formatUnixDate, getBlogId } from '../utils';
import ViewTags from '../utils/ViewTags';
import BlogStatsRow from './BlogStatsRow';
import SpaceNav from './SpaceNav';
import { ViewBlogProps } from './ViewBlogProps';
import withLoadBlogDataById from './withLoadBlogDataById';

type Props = ViewBlogProps

export const AboutBlogPage: NextPage<Props> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { blogData } = props;

  if (!blogData || !blogData?.struct) {
    return <NoData description={<span>Blog not found</span>} />
  }

  const { owner } = props;
  const blog = blogData.struct;
  const { id, created: { account, time } } = blog;

  const [ content ] = useState(blogData?.content || {} as BlogContent);
  const { name, desc, image, tags } = content;

  const BlogAuthor = () =>
    <AuthorPreview
      address={account}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      details={<div>Created on {formatUnixDate(time)}</div>}
    />

  const title = `About ${name}`

  // TODO extract WithSpaceNav

  return <div className='ViewBlogWrapper'>
    {isBrowser &&
      <SpaceNav
        {...content}
        blogId={new BN(id)}
        creator={account}
      />
    }
    <HeadMeta title={title} desc={mdToText(desc)} image={image} />
    <Section className='DfContentPage' level={1} title={title}>

      <div className='DfRow mt-3'>
        <BlogAuthor />
        <BlogStatsRow blog={blog} />
      </div>

      {nonEmptyStr(desc) &&
        <div className='DfBookPage'>
          <DfMd source={desc} />
        </div>
      }
      <ViewTags tags={tags} />
    </Section>
  </div>
}

// TODO extract getInitialProps, this func is similar in ViewBlog

AboutBlogPage.getInitialProps = async (props): Promise<Props> => {
  const { query: { blogId } } = props
  const idOrHandle = blogId as string

  const id = await getBlogId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const subsocial = await getSubsocialApi()
  const blogData = id && await subsocial.findBlog(id)
  if (!blogData?.struct) {
    return return404(props)
  }

  const ownerId = blogData?.struct.owner
  const owner = await subsocial.findProfile(ownerId)

  return {
    blogData,
    owner
  }
}

export default AboutBlogPage

export const AboutBlog = withLoadBlogDataById(AboutBlogPage)
