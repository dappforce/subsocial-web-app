import React from 'react';
import { ViewBlog } from './ViewBlog';
import { useStorybookContext } from '../utils/StorybookContext';
import BN from 'bn.js';

type Props = {
  blogId: BN
  title: JSX.Element | string
}

export const BloggedSectionTitle = ({
  blogId,
  title
}: Props) => {
  const { isStorybook } = useStorybookContext()
  return <>
    {!isStorybook && <>
      {/* TODO replace '<a />' tag with Next Link + URL builder */}
      <a href={`/blogs/${blogId.toString()}`}>
        <ViewBlog nameOnly={true} id={blogId} />
      </a>
      <span style={{ margin: '0 .75rem' }}>/</span>
    </>}
    {title}
  </>
}

export default BloggedSectionTitle
