import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BlogId } from '@subsocial/types/substrate/interfaces';
import BN from 'bn.js'
import { getBlogId } from '../utils/substrate';

export function withBlogIdFromUrl<Props = { id: BlogId }>
  (Component: React.ComponentType<Props>) {

  return function (props: Props) {
    const router = useRouter();
    const { blogId } = router.query;
    const idOrHandle = blogId as string
    try {
      const [ id, setId ] = useState<BN>()

      useEffect(() => {
        const getId = async () => {
          const id = await getBlogId(idOrHandle)
          id && setId(id)
        }
        getId().catch(err => console.error(err))
      }, [ false ])

      return !id ? null : <Component id={id} {...props} />;
    } catch (err) {
      return <em>Invalid blog ID or handle: {idOrHandle}</em>;
    }
  };
}
