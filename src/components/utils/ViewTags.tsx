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
      <Link key={tag} href={`/search?tags=${tag}`}>
        <Tag>{tag}</Tag>
      </Link>
    )}
  </div>
}

export default ViewTags
