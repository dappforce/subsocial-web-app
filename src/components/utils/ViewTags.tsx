import { isEmptyArray, isEmptyStr, nonEmptyStr } from '@subsocial/utils';
import { TagOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import Link from 'next/link';
import React from 'react';
import { BaseProps } from '@polkadot/react-identicon/types';

type ViewTagProps = {
  tag?: string
}

const ViewTag = React.memo(({ tag }: ViewTagProps) =>
  isEmptyStr(tag)
    ? null
    : <Tag key={tag} className='mt-2'>
      <Link href='/search' as={`/search?tags=${tag}`}>
        <a className='DfGreyLink'><TagOutlined />{tag}</a>
      </Link>
    </Tag>
)

type ViewTagsProps = BaseProps & {
  tags?: string[]
}

export const ViewTags = React.memo(({
  tags = [],
  className = '',
  ...props
}: ViewTagsProps) =>
  isEmptyArray(tags)
    ? null
    : <div className={`DfTags ${className}`} {...props}>
      {tags.filter(nonEmptyStr).map((tag, i) => <ViewTag key={`${tag}-${i}`} tag={tag} />)}
    </div>
)

export default ViewTags
