import { isEmptyArray } from '@subsocial/utils';
import { Icon, Tag } from 'antd';
import Link from 'next/link';
import React from 'react';

type Props = {
  tags?: string[]
  className?: string
}

export const ViewTags = ({ tags = [], className = '' }: Props) => {
  if (isEmptyArray(tags)) return null

  return <div className={`DfTags ${className}`}>
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
