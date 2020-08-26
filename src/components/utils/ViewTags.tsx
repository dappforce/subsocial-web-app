import { isEmptyArray } from '@subsocial/utils';
import { TagOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import Link from 'next/link';
import React from 'react';

type Props = {
  tags?: string[]
  className?: string
}

export const ViewTags = ({ tags = [], className = '' }: Props) => {
  if (isEmptyArray(tags)) return null

  return (
    <div className={`DfTags ${className}`}>
      {tags.map(tag =>
        <Tag key={tag}>
          <Link href='/search' as={`/search?tags=${tag}`}>
            <a><TagOutlined />{tag}</a>
          </Link>
        </Tag>
      )}
    </div>
  )
}

export default ViewTags
