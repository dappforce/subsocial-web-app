import React from 'react';
import { Tag } from 'antd';
import { isEmptyArray } from '@subsocial/utils';
import Link from 'next/link';

type Props = {
  tags?: string[]
}

export const ViewTags = ({ tags = [] }: Props) => {
  if (isEmptyArray(tags)) return null

  return <div className='DfTags'>
    {tags.map(tag =>
      <Link href={`/search?q="${tag}"`}>
        <Tag key={tag}>{tag}</Tag>
      </Link>
    )}
  </div>
}

export default ViewTags
