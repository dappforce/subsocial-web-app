import React from 'react';
import { Tag, Icon } from 'antd';
import { isEmptyArray } from '@subsocial/utils';
import Link from 'next/link';

type Props = {
  tags?: string[]
}

export const ViewTags = ({ tags = [] }: Props) => {
  if (isEmptyArray(tags)) return null

  return <div className='DfTags'>
    {tags.map(tag =>
      <Tag key={tag}>
        <Link href={`/search?tags=${tag}`}>
          <a><Icon type='tag' />{tag}</a>
        </Link>
      </Tag>
    )}
  </div>
}

export default ViewTags
