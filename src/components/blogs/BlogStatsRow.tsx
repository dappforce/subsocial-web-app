import { Blog } from '@subsocial/types/substrate/interfaces';
import BN from 'bn.js';
import Link from 'next/link';
import React, { useState } from 'react';

import { BlogFollowersModal } from '../profiles/AccountsListModal';
import { ZERO } from '../utils';
import { MutedSpan } from '../utils/MutedText';
import { isMyAddress } from '../utils/MyAccountContext';
import { Pluralize } from '../utils/Plularize';
import { blogUrl } from '../utils/urls';

type Props = {
  blog: Blog
}

export const BlogStatsRow = ({ blog }: Props) => {
  const {
    id,
    score,
    created: { account },
    posts_count,
    followers_count: followers
  } = blog;

  const [ followersOpen, setFollowersOpen ] = useState(false);

  const isMyBlog = isMyAddress(account);
  const postsCount = new BN(posts_count).eq(ZERO) ? 0 : new BN(posts_count);
  const followersClassName = 'DfStatItem DfGreyLink ' + (!followers && 'disable')

  return (
    <div className={`DfBlogStats ${isMyBlog && 'MyBlog'}`}>
      <Link href='/blogs/[blogId]' as={blogUrl(blog)}>
        <a className={'DfStatItem ' + (!postsCount && 'disable')}>
          <Pluralize count={postsCount} singularText='Post'/>
        </a>
      </Link>

      <div onClick={() => setFollowersOpen(true)} className={followersClassName}>
        <Pluralize count={followers} singularText='Follower'/>
      </div>

      <MutedSpan className='DfStatItem'>
        <Pluralize count={score} singularText='Point' />
      </MutedSpan>

      {followersOpen &&
        <BlogFollowersModal
          id={id}
          title={<Pluralize count={followers} singularText='Follower'/>}
          accountsCount={blog.followers_count}
          open={followersOpen}
          close={() => setFollowersOpen(false)}
        />
      }
    </div>
  )
}

export default BlogStatsRow
