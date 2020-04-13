import React from 'react';
import { Tag } from 'antd';
import { isEmptyArray } from '@subsocial/utils';

type Props = {
  tags?: string[]
}

export const ViewTags = ({ tags = [] }: Props) => {
  if (isEmptyArray(tags)) return null

  return <div className='DfTags'>
    {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
  </div>
}

export default ViewTags
